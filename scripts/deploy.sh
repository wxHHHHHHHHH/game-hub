#!/bin/bash
# ============================================================
# GameHub - Quick Build & Deploy Script
# ============================================================
# Usage:   sudo bash deploy.sh
# Prereq:  install_server.sh must be run first
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DEPLOY_DIR="/opt/gamehub"
UPLOAD_DIR="/var/gamehub/uploads"
LOG_DIR="$DEPLOY_DIR/logs"

echo ""
echo "=========================================="
echo "  GameHub 一键部署"
echo "=========================================="
echo ""
info "项目目录: $PROJECT_DIR"
info "部署目录: $DEPLOY_DIR"

# ============================================================
# 1. Check Prerequisites
# ============================================================
echo ""
echo "--- 1/6 检查环境 ---"

command -v java  &>/dev/null  || { echo "请先安装 JDK 17"; exit 1; }
command -v mvn   &>/dev/null  || { echo "请先安装 Maven"; exit 1; }
command -v mysql &>/dev/null  || { echo "请先安装 MySQL"; exit 1; }

JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '"\K[0-9]+')
if [ "$JAVA_VER" -lt 17 ] 2>/dev/null; then
    warn "JDK 版本 $JAVA_VER < 17，可能不兼容"
fi

log "环境检查通过"
info "JDK: $(java -version 2>&1 | head -1)"
info "Maven: $(mvn --version 2>&1 | head -1)"

# ============================================================
# 2. Build Backend
# ============================================================
echo ""
echo "--- 2/6 构建后端 ---"

cd "$BACKEND_DIR"
info "正在 Maven 构建..."
mvn clean package -DskipTests -q

JAR_FILE=$(find target -maxdepth 1 -name "*.jar" ! -name "*sources*" | head -1)
if [ -z "$JAR_FILE" ]; then
    echo "构建失败：找不到 JAR 文件"
    exit 1
fi

log "后端构建完成: $JAR_FILE"

# ============================================================
# 3. Create Deploy Directories
# ============================================================
echo ""
echo "--- 3/6 创建部署目录 ---"

sudo mkdir -p "$DEPLOY_DIR"
sudo mkdir -p "$UPLOAD_DIR/videos/original"
sudo mkdir -p "$UPLOAD_DIR/videos/hls"
sudo mkdir -p "$LOG_DIR"

log "部署目录创建完成"

# ============================================================
# 4. Copy Files
# ============================================================
echo ""
echo "--- 4/6 部署文件 ---"

# Stop service if running
sudo systemctl stop gamehub 2>/dev/null || true

# Backend JAR
sudo cp "$JAR_FILE" "$DEPLOY_DIR/game-hub.jar"

# Frontend
sudo rm -rf "$DEPLOY_DIR/frontend" 2>/dev/null || true
sudo cp -r "$FRONTEND_DIR" "$DEPLOY_DIR/frontend"

# Update frontend config for production
sudo sed -i "s|http://localhost:27890/api|/api|g" "$DEPLOY_DIR/frontend/js/config.js" 2>/dev/null || true
sudo sed -i "s|http://localhost:8081/api|/api|g" "$DEPLOY_DIR/frontend/js/config.js" 2>/dev/null || true

log "文件部署完成"

# ============================================================
# 5. Setup Permissions
# ============================================================
echo ""
echo "--- 5/6 设置权限 ---"

# Create gamehub user if not exists
id -u gamehub &>/dev/null || sudo useradd -r -s /bin/false gamehub

sudo chown -R gamehub:gamehub "$DEPLOY_DIR"
sudo chown -R gamehub:gamehub "$UPLOAD_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
sudo chmod -R 755 "$UPLOAD_DIR"

log "权限设置完成"

# ============================================================
# 6. Setup Systemd Service
# ============================================================
echo ""
echo "--- 6/6 配置系统服务 ---"

# Create env config if not exists
ENV_FILE="/etc/gamehub/env.conf"
if [ ! -f "$ENV_FILE" ]; then
    info "创建环境变量配置..."
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "ChangeThisSecretKeyInProduction!!")

    sudo mkdir -p /etc/gamehub
    sudo tee "$ENV_FILE" > /dev/null <<EOF
DB_HOST=127.0.0.1
DB_PORT=35087
DB_NAME=gamehub
DB_USERNAME=root
DB_PASSWORD=Root@123456
JWT_SECRET=$JWT_SECRET
SERVER_PORT=27890
UPLOAD_DIR=$UPLOAD_DIR
EOF
    sudo chmod 600 "$ENV_FILE"
    log "环境变量配置: $ENV_FILE"
else
    log "环境变量配置已存在"
fi

# Create systemd service
sudo tee /etc/systemd/system/gamehub.service > /dev/null <<EOF
[Unit]
Description=GameHub Backend Service
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=gamehub
Group=gamehub
WorkingDirectory=$DEPLOY_DIR
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/java \\
  -Xms512m -Xmx1024m \\
  -XX:+UseG1GC \\
  -Djava.awt.headless=true \\
  -jar $DEPLOY_DIR/game-hub.jar \\
  --spring.profiles.active=prod
StandardOutput=append:$LOG_DIR/app.log
StandardError=append:$LOG_DIR/error.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gamehub
sudo systemctl start gamehub

sleep 5
if sudo systemctl is-active --quiet gamehub; then
    log "GameHub 服务启动成功"
else
    warn "服务可能未正常启动，检查日志:"
    sudo journalctl -u gamehub --no-pager -n 20
    echo ""
    warn "也可能是数据库密码不匹配，请编辑 /etc/gamehub/env.conf"
fi

# ============================================================
# 7. Setup Nginx (if available)
# ============================================================
echo ""
if command -v nginx &>/dev/null; then
    info "配置 Nginx..."

    NGINX_CONF="/etc/nginx/sites-available/gamehub"
    if [ -d "/etc/nginx/conf.d" ]; then
        NGINX_CONF="/etc/nginx/conf.d/gamehub.conf"
    fi

    sudo tee "$NGINX_CONF" > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    root /opt/gamehub/frontend;
    index index.html;

    location /uploads/ {
        alias /var/gamehub/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:27890;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 2048m;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain application/json text/css application/javascript;
    gzip_min_length 1000;
}
NGINX

    # Enable site (Debian/Ubuntu style)
    if [ -d "/etc/nginx/sites-enabled" ]; then
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/gamehub 2>/dev/null || true
    fi

    sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null && log "Nginx 配置完成" || warn "Nginx 配置有误，请手动检查"
else
    info "Nginx 未安装，跳过反向代理配置"
    info "后端直接运行在 http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost'):27890"
fi

# ============================================================
# Done
# ============================================================
echo ""
echo "=========================================="
echo -e "${GREEN}  GameHub 部署完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址:"
if command -v nginx &>/dev/null; then
    echo "  http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'your-server')"
else
    echo "  http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost'):27890"
fi
echo ""
echo "演示账号:"
echo "  管理员 : admin / admin123"
echo "  成员   : player / player123"
echo "  游客   : visitor / visitor123"
echo ""
echo "管理命令:"
echo "  查看状态 : sudo systemctl status gamehub"
echo "  查看日志 : tail -f $LOG_DIR/app.log"
echo "  重启服务 : sudo systemctl restart gamehub"
echo "  停止服务 : sudo systemctl stop gamehub"
echo ""
echo "⚠ 生产环境请务必:"
echo "  1. 修改 /etc/gamehub/env.conf 中的 JWT_SECRET"
echo "  2. 修改 /etc/gamehub/env.conf 中的 DB_PASSWORD"
echo "  3. 配置 HTTPS 证书"
echo "  4. 配置防火墙只开放 80/443 端口"
echo ""
