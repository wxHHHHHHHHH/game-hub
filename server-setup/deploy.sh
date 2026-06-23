#!/bin/bash
# ============================================
# GameHub — 一键部署
# 用法: cd /opt/gamehub && bash server-setup/deploy.sh
# ============================================
set -e

GREEN='\033[0;32m' YELLOW='\033[1;33m' NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$SCRIPT_DIR/logs"
PID_DIR="$SCRIPT_DIR/pids"
SERVER_PORT=27890

mkdir -p "$LOG_DIR" "$PID_DIR" /opt/gamehub/uploads

case "${1:-all}" in
    db)
        bash "$SCRIPT_DIR/init-db.sh"
        ;;

    build)
        echo "📦 Maven 编译..."
        cd "$PROJECT_DIR/backend"
        mvn clean package -DskipTests -q 2>&1 | tail -5
        log "编译完成"
        ;;

    start)
        echo "🚀 启动 GameHub (:$SERVER_PORT)..."
        # 停旧进程
        local pid=$(cat "$PID_DIR/gamehub.pid" 2>/dev/null || true)
        [ -n "$pid" ] && kill "$pid" 2>/dev/null && log "已停止旧进程"
        sleep 2

        # 启动
        local jar=$(ls "$PROJECT_DIR/backend/target/"game-hub*.jar 2>/dev/null | grep -v sources | head -1)
        if [ -z "$jar" ]; then
            warn "JAR 不存在，先 build"
            exit 1
        fi

        nohup java -Xms256m -Xmx512m \
            -Dspring.profiles.active=server-local \
            -jar "$jar" \
            > "$LOG_DIR/gamehub.log" 2>&1 &
        echo $! > "$PID_DIR/gamehub.pid"
        log "GameHub 已启动 (PID: $(cat $PID_DIR/gamehub.pid))"
        sleep 5
        ;;

    stop)
        local pid=$(cat "$PID_DIR/gamehub.pid" 2>/dev/null || true)
        [ -n "$pid" ] && kill "$pid" 2>/dev/null && log "已停止"
        rm -f "$PID_DIR/gamehub.pid"
        ;;

    status)
        source "$SCRIPT_DIR/app-ports.env" 2>/dev/null || true
        local code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$SERVER_PORT 2>/dev/null || echo "000")
        if [ "$code" != "000" ]; then
            log "GameHub 运行中 (http://localhost:$SERVER_PORT)"
        else
            warn "GameHub 未运行"
        fi
        ;;

    frontend)
        echo "🌐 部署前端..."
        # 用商城项目的 Nginx，新增 GameHub 配置
        cat > /etc/nginx/sites-available/gamehub << 'NGINX'
server {
    listen 27891;
    server_name _;

    root /opt/gamehub/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:27890;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        alias /opt/gamehub/uploads/;
    }
}
NGINX
        ln -sf /etc/nginx/sites-available/gamehub /etc/nginx/sites-enabled/gamehub
        nginx -t 2>&1 && systemctl reload nginx
        log "前端已部署: http://服务器IP:27891"
        ;;

    all)
        bash "$0" db
        bash "$0" build
        bash "$0" start
        bash "$0" frontend
        ;;

    *)
        echo "用法: bash deploy.sh [db|build|start|stop|status|frontend|all]"
        ;;
esac

echo ""
echo "========================================"
echo -e " ${GREEN}GameHub 部署完成${NC}"
echo "  API:  http://服务器IP:27890"
echo "  前端: http://服务器IP:27891"
echo "========================================"
