#!/bin/bash
# ============================================================
# GameHub - Auto Deploy from GitHub
# ============================================================
# Usage:   sudo bash auto_deploy.sh
# The server pulls latest code from GitHub, builds, and deploys.
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

REPO_DIR="/home/user/game-hub"
DEPLOY_DIR="/opt/gamehub"
UPLOAD_DIR="/var/gamehub/uploads"
LOG_DIR="$DEPLOY_DIR/logs"
JAVA_HOME="/usr/lib/jvm/java-17-alibaba-dragonwell-17.0.16.0.17.8-1.alnx4.x86_64"
MAVEN_HOME="/opt/maven"

# ============================================================
# 1. Pull latest code from GitHub
# ============================================================
echo ""
echo "=========================================="
echo "  1/5 拉取最新代码"
echo "=========================================="

cd "$REPO_DIR"
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || {
    warn "Git pull failed, check network or credentials"
    warn "Skipping pull, using current code"
}
log "代码同步完成"

# ============================================================
# 2. Build backend
# ============================================================
echo ""
echo "--- 2/5 构建后端 ---"

export JAVA_HOME
export PATH="$JAVA_HOME/bin:$MAVEN_HOME/bin:$PATH"

cd "$REPO_DIR/backend"
mvn clean package -DskipTests -q
log "后端构建完成"

# ============================================================
# 3. Stop service
# ============================================================
echo ""
echo "--- 3/5 停止服务 ---"
sudo systemctl stop gamehub 2>/dev/null || sudo pkill -f game-hub 2>/dev/null || true
sleep 2
log "服务已停止"

# ============================================================
# 4. Deploy files
# ============================================================
echo ""
echo "--- 4/5 部署文件 ---"

# Backend JAR
JAR_FILE=$(find "$REPO_DIR/backend/target" -maxdepth 1 -name "*.jar" ! -name "*sources*" | head -1)
sudo cp "$JAR_FILE" "$DEPLOY_DIR/game-hub.jar"

# Frontend
sudo rm -rf "$DEPLOY_DIR/frontend" 2>/dev/null || true
sudo cp -r "$REPO_DIR/frontend" "$DEPLOY_DIR/frontend"

# Fix API URL for production
sudo sed -i 's|http://localhost:8080/api|/api|g' "$DEPLOY_DIR/frontend/js/config.js"
sudo sed -i 's|http://localhost:8081/api|/api|g' "$DEPLOY_DIR/frontend/js/config.js"

# Permissions
sudo chown -R gamehub:gamehub "$DEPLOY_DIR"
sudo chown -R gamehub:gamehub "$UPLOAD_DIR"

log "文件部署完成"

# ============================================================
# 5. Start service
# ============================================================
echo ""
echo "--- 5/5 启动服务 ---"

# Load env
if [ -f /etc/gamehub/env.conf ]; then
    source /etc/gamehub/env.conf
fi

DB_PASS="${DB_PASSWORD:-changeme}"

# Create log dir
sudo mkdir -p "$LOG_DIR"
sudo chown gamehub:gamehub "$LOG_DIR"

sudo -u gamehub nohup "$JAVA_HOME/bin/java" \
  -Xms512m -Xmx1024m \
  -DDB_PASSWORD="$DB_PASS" \
  -jar "$DEPLOY_DIR/game-hub.jar" \
  --spring.profiles.active=prod \
  --spring.jpa.hibernate.ddl-auto=update \
  > "$LOG_DIR/app.log" 2>&1 &

sleep 8

# Verify
if curl -s -o /dev/null http://127.0.0.1:8080/api/videos; then
    log "后端启动成功"
else
    warn "后端可能未正常启动，查看日志: tail -30 $LOG_DIR/app.log"
fi

# Reload Nginx
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null && log "Nginx 已重载" || true

# ============================================================
echo ""
echo "=========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "=========================================="
echo ""
echo "后端状态:"
curl -s http://127.0.0.1:8080/api/videos | head -c 80 && echo ""
echo ""
echo "访问: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '47.108.130.167')"
