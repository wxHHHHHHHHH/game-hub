#!/bin/bash
# ============================================
# GameHub — 安装 Java 17 + Nginx
# MySQL/Redis 复用商城项目的 Docker 容器
# 用法: sudo bash install.sh
# ============================================
set -e

GREEN='\033[0;32m' NC='\033[0m'
log() { echo -e "${GREEN}[✓]${NC} $1"; }

echo "========================================"
echo " GameHub — 环境安装"
echo "========================================"

# ---- 1. Java 17 ----
if command -v java &>/dev/null; then
    log "Java 已安装: $(java -version 2>&1 | head -1)"
else
    echo "📦 安装 OpenJDK 17..."
    apt-get update -qq && apt-get install -y -qq openjdk-17-jdk
    log "Java 17 安装完成"
fi

# ---- 2. Nginx ----
if command -v nginx &>/dev/null; then
    log "Nginx 已安装"
else
    echo "📦 安装 Nginx..."
    apt-get install -y -qq nginx
    log "Nginx 安装完成"
fi

# ---- 3. 检查 Docker（必须已有）----
if docker ps &>/dev/null 2>&1; then
    log "Docker 已运行"
else
    echo "❌ Docker 未运行！请先安装 Docker（参考商城项目 server-setup/install.sh）"
    exit 1
fi

# ---- 4. 检查 MySQL/Redis 容器 ----
if docker ps | grep -q mall-mysql; then
    log "MySQL 容器已运行"
else
    echo "❌ MySQL 容器未运行！请先启动商城项目的 start.sh"
    exit 1
fi

if docker ps | grep -q mall-redis; then
    log "Redis 容器已运行"
else
    echo "❌ Redis 容器未运行！请先启动商城项目的 start.sh"
    exit 1
fi

# ---- 5. 创建上传目录 ----
mkdir -p /opt/gamehub/uploads
log "上传目录已创建: /opt/gamehub/uploads"

echo ""
echo "========================================"
echo " ✅ 环境就绪"
echo "========================================"
echo "  Java:   $(java -version 2>&1 | head -1)"
echo "  Nginx:  $(nginx -v 2>&1)"
echo "  MySQL:  127.0.0.1:41728 (Docker)"
echo "  Redis:  127.0.0.1:52936 (Docker)"
echo ""
echo "下一步: bash server-setup/deploy.sh all"
