#!/bin/bash
# ============================================================
# GameHub - Linux Server Environment Installer
# ============================================================
# Supports: Ubuntu 20.04+/Debian 11+, CentOS 8+/RHEL 8+
# Usage:   sudo bash install_server.sh
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

# ============================================================
# Check root
# ============================================================
if [ "$(id -u)" -ne 0 ]; then
    err "请使用 sudo 运行此脚本"
fi

# ============================================================
# Detect OS
# ============================================================
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID
else
    err "无法检测操作系统"
fi

info "检测到操作系统: $OS $OS_VERSION"

case "$OS" in
    ubuntu|debian)
        PKG_MGR="apt"
        ;;
    centos|rhel|rocky|almalinux|fedora)
        PKG_MGR="dnf"
        ;;
    *)
        warn "未知系统: $OS，尝试使用 apt"
        PKG_MGR="apt"
        ;;
esac

# ============================================================
# 1. System Update
# ============================================================
echo ""
echo "=========================================="
echo "  1/5 更新系统包管理器"
echo "=========================================="
if [ "$PKG_MGR" = "apt" ]; then
    apt update -y && apt upgrade -y
else
    dnf update -y
fi
log "系统更新完成"

# ============================================================
# 2. Install JDK 17
# ============================================================
echo ""
echo "=========================================="
echo "  2/5 安装 OpenJDK 17"
echo "=========================================="
if [ "$PKG_MGR" = "apt" ]; then
    apt install -y openjdk-17-jdk
else
    dnf install -y java-17-openjdk-devel
fi
log "JDK 17 安装完成"
java -version 2>&1 | head -1

# ============================================================
# 3. Install MySQL 8.0
# ============================================================
echo ""
echo "=========================================="
echo "  3/5 安装 MySQL 8.0"
echo "=========================================="

MYSQL_ROOT_PW="Root@123456"

if command -v mysql &>/dev/null; then
    log "MySQL 已安装，跳过"
else
    if [ "$PKG_MGR" = "apt" ]; then
        # Ubuntu/Debian
        export DEBIAN_FRONTEND=noninteractive
        apt install -y mysql-server-8.0 2>/dev/null || \
        apt install -y mysql-server 2>/dev/null || \
        apt install -y default-mysql-server 2>/dev/null
    else
        # CentOS/RHEL
        dnf install -y mysql-server
    fi
    log "MySQL 安装完成"
fi

# Start MySQL
if [ "$PKG_MGR" = "apt" ]; then
    systemctl start mysql 2>/dev/null || service mysql start 2>/dev/null || true
else
    systemctl start mysqld
    systemctl enable mysqld
fi

# Set root password & create database
info "配置数据库..."
if [ "$PKG_MGR" = "apt" ]; then
    # Ubuntu: try socket auth first
    mysql -u root <<SQL 2>/dev/null || {
        # If socket auth fails, try with --skip-grant-tables or previous password
        warn "Socket 认证失败，尝试使用默认密码..."
    }
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PW}';
FLUSH PRIVILEGES;
SQL
else
    # CentOS: get temp password
    TEMP_PW=$(grep 'temporary password' /var/log/mysqld.log 2>/dev/null | tail -1 | awk '{print $NF}')
    if [ -n "$TEMP_PW" ]; then
        mysql --connect-expired-password -u root -p"$TEMP_PW" <<SQL 2>/dev/null
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PW}';
FLUSH PRIVILEGES;
SQL
    fi
fi

# Create gamehub database (try with password)
mysql -u root -p"${MYSQL_ROOT_PW}" <<SQL 2>/dev/null || mysql -u root <<SQL 2>/dev/null
CREATE DATABASE IF NOT EXISTS gamehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
SQL

log "数据库 gamehub 创建完成"
info "MySQL root 密码: ${MYSQL_ROOT_PW}"

# ============================================================
# 4. Install Maven (optional)
# ============================================================
echo ""
echo "=========================================="
echo "  4/5 安装 Maven"
echo "=========================================="
if command -v mvn &>/dev/null; then
    log "Maven 已安装，跳过"
else
    if [ "$PKG_MGR" = "apt" ]; then
        apt install -y maven
    else
        dnf install -y maven
    fi
    log "Maven 安装完成"
fi
mvn --version 2>&1 | head -1 || true

# ============================================================
# 5. Install FFmpeg (optional)
# ============================================================
echo ""
echo "=========================================="
echo "  5/5 安装 FFmpeg (可选)"
echo "=========================================="
if command -v ffmpeg &>/dev/null; then
    log "FFmpeg 已安装，跳过"
else
    if [ "$PKG_MGR" = "apt" ]; then
        apt install -y ffmpeg 2>/dev/null || warn "FFmpeg 安装失败（非关键）"
    else
        dnf install -y epel-release 2>/dev/null || true
        dnf install -y ffmpeg 2>/dev/null || warn "FFmpeg 安装失败（非关键）"
    fi
fi
ffmpeg -version 2>&1 | head -1 || warn "FFmpeg 未安装（HLS 转码将不可用）"

# ============================================================
# 6. Install Nginx (optional)
# ============================================================
echo ""
echo "=========================================="
echo "  额外: 安装 Nginx"
echo "=========================================="
if command -v nginx &>/dev/null; then
    log "Nginx 已安装，跳过"
else
    if [ "$PKG_MGR" = "apt" ]; then
        apt install -y nginx
    else
        dnf install -y nginx
    fi
    log "Nginx 安装完成"
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo "=========================================="
echo -e "${GREEN}  环境安装完成！${NC}"
echo "=========================================="
echo ""
echo "已安装软件:"
echo "  JDK 17     : $(java -version 2>&1 | head -1 || echo 'N/A')"
echo "  MySQL 8.0  : $(mysql --version 2>&1 | head -1 || echo 'N/A')"
echo "  Maven      : $(mvn --version 2>&1 | head -1 || echo 'N/A')"
echo "  FFmpeg     : $(ffmpeg -version 2>&1 | head -1 || echo 'N/A')"
echo "  Nginx      : $(nginx -v 2>&1 || echo 'N/A')"
echo ""
echo "数据库信息:"
echo "  地址     : localhost:35087"
echo "  数据库   : gamehub"
echo "  用户名   : root"
echo "  密码     : ${MYSQL_ROOT_PW}"
echo ""
echo "下一步:"
echo "  1. 修改 backend/src/main/resources/application.yml 中的数据库密码"
echo "  2. 运行部署脚本: bash scripts/deploy.sh"
echo ""
echo "安全提醒:"
echo "  - 生产环境务必修改 MySQL root 密码"
echo "  - 生产环境务必修改 JWT secret"
echo ""
