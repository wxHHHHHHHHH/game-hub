#!/bin/bash
# ============================================================
# 波比 Vue 前端 — 一键部署脚本
# ============================================================
set -e

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[OK]${NC} $1"; }

REPO="/home/user/game-hub"
VUE_DIR="$REPO/frontend-vue"
DEPLOY_DIR="/opt/gamehub/frontend"

echo "=========================================="
echo "  波比 Vue 前端部署"
echo "=========================================="

# 1. Pull code
echo "--- Git 拉取 ---"
cd "$REPO" && git pull
log "代码同步"

# 2. Install deps
echo "--- 安装依赖 ---"
cd "$VUE_DIR"
npm install --silent 2>&1 | tail -2
log "依赖安装完成"

# 3. Build
echo "--- Vite 构建 ---"
npx vite build 2>&1 | tail -5
log "构建完成"

# 4. Deploy
echo "--- 部署 ---"
sudo rm -rf "$DEPLOY_DIR"
sudo cp -r "$VUE_DIR/dist" "$DEPLOY_DIR"
sudo chown -R gamehub:gamehub "$DEPLOY_DIR"
log "文件部署到 $DEPLOY_DIR"

# 5. Reload Nginx
sudo nginx -t && sudo systemctl reload nginx && log "Nginx 已重载"

echo ""
echo "=========================================="
echo -e "${GREEN}  Vue 前端部署完成！${NC}"
echo "  访问 http://$(hostname -I | awk '{print $1}')"
echo "=========================================="
