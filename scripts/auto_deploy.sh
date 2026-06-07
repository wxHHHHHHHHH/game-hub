#!/bin/bash
# ============================================================
# GameHub - 一键自动部署脚本
# ============================================================
# 用法:
#   sudo bash auto_deploy.sh          # 部署整个项目
#   sudo bash auto_deploy.sh backend   # 只部署后端
#   sudo bash auto_deploy.sh frontend  # 只部署前端
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }
info() { echo -e "${CYAN}[..]${NC} $1"; }

# ========== 配置 ==========
REPO_DIR="/home/user/game-hub"
DEPLOY_DIR="/opt/gamehub"
UPLOAD_DIR="/var/gamehub/uploads"
LOG_DIR="$DEPLOY_DIR/logs"
JAVA_HOME="/usr/lib/jvm/java-17-alibaba-dragonwell-17.0.16.0.17.8-1.alnx4.x86_64"

# 根据服务器实际情况修改下面这个
MAVEN_CMD=""  # 留空则自动查找

STEP="${1:-all}"

# ========== 环境检查 ==========
echo ""
echo "=============================================="
echo "  GameHub 自动部署"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="
echo ""

# 找 Java
if [ ! -f "$JAVA_HOME/bin/java" ]; then
    JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java 2>/dev/null) 2>/dev/null)))
    if [ ! -f "$JAVA_HOME/bin/java" ]; then
        err "找不到 Java，请设置 JAVA_HOME"
        exit 1
    fi
fi
log "Java: $JAVA_HOME"

# 找 Maven
find_maven() {
    [ -n "$MAVEN_CMD" ] && return
    for m in /opt/maven/bin/mvn /usr/share/maven/bin/mvn /usr/bin/mvn; do
        [ -f "$m" ] && MAVEN_CMD="$m" && return
    done
    MAVEN_CMD=$(which mvn 2>/dev/null) || true
}
find_maven

export JAVA_HOME
export PATH="$JAVA_HOME/bin:$(dirname "$MAVEN_CMD" 2>/dev/null):$PATH"

# ========== 1. 拉代码 ==========
if [ "$STEP" = "all" ] || [ "$STEP" = "backend" ] || [ "$STEP" = "frontend" ]; then
    echo ""
    echo "--- 1/5 Git 拉取代码 ---"
    cd "$REPO_DIR"
    git pull 2>&1 || warn "拉取失败，使用当前代码继续"
    log "代码已是最新"
fi

# ========== 2. 构建后端 ==========
if [ "$STEP" = "all" ] || [ "$STEP" = "backend" ]; then
    echo ""
    echo "--- 2/5 构建后端 ---"

    if [ -z "$MAVEN_CMD" ] || [ ! -f "$MAVEN_CMD" ]; then
        err "找不到 Maven，请先安装: sudo dnf install -y maven"
        err "或指定 MAVEN_CMD 路径"
        exit 1
    fi

    log "Maven: $MAVEN_CMD"
    cd "$REPO_DIR/backend"

    "$MAVEN_CMD" clean package -DskipTests -q 2>&1 | tail -3
    JAR=$(find target -maxdepth 1 -name "*.jar" ! -name "*sources*" | head -1)

    if [ -z "$JAR" ] || [ ! -f "$JAR" ]; then
        err "构建失败，找不到 JAR"
        exit 1
    fi
    log "后端构建完成: $JAR"
fi

# ========== 3. 停止旧服务 ==========
if [ "$STEP" = "all" ] || [ "$STEP" = "backend" ]; then
    echo ""
    echo "--- 3/5 停止服务 ---"
    # 只杀 Java 进程，不杀脚本自身
    sudo pkill -f "java.*game-hub.jar" 2>/dev/null && log "旧进程已终止" || true
    sleep 2
fi

# ========== 4. 部署文件 ==========
echo ""
echo "--- 4/5 部署文件 ---"

# 后端
if [ "$STEP" = "all" ] || [ "$STEP" = "backend" ]; then
    sudo cp "$REPO_DIR/backend/target/game-hub-"*.jar "$DEPLOY_DIR/game-hub.jar"
    log "后端 JAR 已部署"
fi

# 前端
if [ "$STEP" = "all" ] || [ "$STEP" = "frontend" ]; then
    sudo rm -rf "$DEPLOY_DIR/frontend" 2>/dev/null || true
    sudo cp -r "$REPO_DIR/frontend" "$DEPLOY_DIR/frontend"

    # 修正生产环境 API 地址
    sudo sed -i "s|http://localhost:27890/api|/api|g" "$DEPLOY_DIR/frontend/js/config.js"
    sudo sed -i "s|http://localhost:27890/api|/api|g" "$DEPLOY_DIR/frontend/js/config.js"
    log "前端已部署（API 已指向 /api）"
fi

# 上传目录
sudo mkdir -p "$UPLOAD_DIR"/{videos/original,videos/hls,files}
sudo mkdir -p "$LOG_DIR"

# 权限
id gamehub &>/dev/null || sudo useradd -r -s /bin/false gamehub 2>/dev/null
sudo chown -R gamehub:gamehub "$DEPLOY_DIR" "$UPLOAD_DIR" "$LOG_DIR"
log "目录权限已设置"

# ========== 5. 启动服务 ==========
if [ "$STEP" = "all" ] || [ "$STEP" = "backend" ]; then
    echo ""
    echo "--- 5/5 启动服务 ---"

    # 读数据库密码
    DB_PASS="z43PxYE+MXXBvErc6Bcc2w=="
    if [ -f /etc/gamehub/env.conf ]; then
        source /etc/gamehub/env.conf 2>/dev/null
        DB_PASS="${DB_PASSWORD:-$DB_PASS}"
    fi

    sudo -u gamehub nohup "$JAVA_HOME/bin/java" \
        -Xms512m -Xmx1024m \
        -DDB_PASSWORD="$DB_PASS" \
        -jar "$DEPLOY_DIR/game-hub.jar" \
        --spring.profiles.active=prod \
        --spring.jpa.hibernate.ddl-auto=update \
        > "$LOG_DIR/app.log" 2>&1 &

    sleep 8

    # 验证
    if curl -s -o /dev/null http://127.0.0.1:27890/api/videos; then
        log "后端启动成功"
        curl -s http://127.0.0.1:27890/api/videos | head -c 80 && echo ""
    else
        warn "后端启动可能异常"
        echo "查看日志: tail -30 $LOG_DIR/app.log"
        tail -20 "$LOG_DIR/app.log"
    fi
fi

# Nginx 重载
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null && log "Nginx 已重载"

# ========== 完成 ==========
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "=============================================="
echo -e "  ${GREEN}部署完成！${NC}"
echo "  访问: http://${IP:-47.108.130.167}"
echo "=============================================="
echo ""
echo "快捷命令:"
echo "  查看日志: tail -f $LOG_DIR/app.log"
echo "  重启服务: sudo bash $REPO_DIR/scripts/auto_deploy.sh backend"
echo "  刷新前端: sudo bash $REPO_DIR/scripts/auto_deploy.sh frontend"
echo ""
