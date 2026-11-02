#!/bin/bash
# ============================================================
# GameHub - 纯净服务器一键环境安装脚本
# ============================================================
# 适用: Ubuntu 22.04 / 24.04, Debian 12 (apt 系)
# 安装: OpenJDK 17 + Maven + MySQL 8.0 + Redis + FFmpeg + Nginx + Git
# 用法: sudo bash install_server.sh
#
# 安装后端口约定 (与 application-prod.yml 完全一致):
#   MySQL  : 127.0.0.1:35087   root / Root@123456   库 gamehub
#   Redis  : 127.0.0.1:26379   无密码
#   后端   : 127.0.0.1:27890
#   Nginx  : 80
#
# 注: 阿里云 Ubuntu 默认源已是阿里云镜像，apt update 很快。
#     如果卡在 update，说明源不对，先换阿里云镜像:
#     sudo sed -i 's|http://.*archive.ubuntu.com|http://mirrors.aliyun.com|g; s|http://.*security.ubuntu.com|http://mirrors.aliyun.com|g' /etc/apt/sources.list /etc/apt/sources.list.d/*.list
# ============================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[..]${NC} $1"; }

# ========== 配置 ==========
MYSQL_PORT=35087
MYSQL_ROOT_PW="Root@123456"
DB_NAME="gamehub"
REDIS_PORT=26379
JAVA_HOME_DIR="/usr/lib/jvm/java-17-openjdk-amd64"

# ========== 检查 root ==========
[ "$(id -u)" -eq 0 ] || err "请用 sudo 运行: sudo bash install_server.sh"

# ========== 检测 OS ==========
. /etc/os-release
case "$ID" in
    ubuntu|debian) PKG="apt-get";;
    *) err "本脚本仅支持 Ubuntu/Debian。当前系统: $ID。如果是 CentOS/阿里云Linux 请告诉我，我再补 dnf 版";;
esac

echo ""
echo "=============================================="
echo "  GameHub 环境安装  ($ID $VERSION_ID)"
echo "=============================================="

# ========== 1. 更新包列表 (只 update 不 upgrade，避免卡住) ==========
info "1/7 更新软件包列表..."
export DEBIAN_FRONTEND=noninteractive
$PKG update -y >/dev/null
log "包列表已更新"

# ========== 2. 安装基础软件 ==========
info "2/7 安装软件 (JDK17/Maven/MySQL/Redis/FFmpeg/Nginx/Git)..."
$PKG install -y \
    openjdk-17-jdk \
    maven \
    git \
    curl \
    ffmpeg \
    nginx \
    mysql-server \
    redis-server >/dev/null
log "软件安装完成"

# 配置 Maven 国内镜像 (阿里云)，否则国内从 Central 下载极慢
MAVEN_SETTINGS="/etc/maven/settings.xml"
if [ -f "$MAVEN_SETTINGS" ]; then
    cat > "$MAVEN_SETTINGS" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <mirrors>
    <mirror>
      <id>aliyunmaven</id>
      <mirrorOf>*</mirrorOf>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
EOF
    log "Maven 已配置阿里云镜像加速"
fi

# ========== 3. 配置 Java 17 为默认 ==========
info "3/7 配置 Java 17..."
for bin in java javac; do
    if [ -f "$JAVA_HOME_DIR/bin/$bin" ]; then
        update-alternatives --set "$bin" "$JAVA_HOME_DIR/bin/$bin" 2>/dev/null || true
    fi
done
cat > /etc/profile.d/java17.sh <<EOF
export JAVA_HOME=$JAVA_HOME_DIR
export PATH=\$JAVA_HOME/bin:\$PATH
EOF
export JAVA_HOME="$JAVA_HOME_DIR"
export PATH="$JAVA_HOME/bin:$PATH"
log "Java 17 已设为默认: $JAVA_HOME_DIR"

# ========== 4. 配置 MySQL ==========
info "4/7 配置 MySQL (端口 $MYSQL_PORT)..."
MYSQL_CNF="/etc/mysql/mysql.conf.d/mysqld.cnf"
if grep -qE '^[[:space:]]*port[[:space:]]*=' "$MYSQL_CNF" 2>/dev/null; then
    sed -i -E "s/^[[:space:]]*port[[:space:]]*=.*/port = $MYSQL_PORT/" "$MYSQL_CNF"
else
    sed -i "/\[mysqld\]/a port = $MYSQL_PORT" "$MYSQL_CNF"
fi

systemctl enable mysql >/dev/null 2>&1
systemctl restart mysql
sleep 2

# 设置 root 密码 (Ubuntu 首次 root 走 auth_socket 免密)
if mysql -u root -e "SELECT 1" &>/dev/null; then
    mysql -u root <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '$MYSQL_ROOT_PW';
FLUSH PRIVILEGES;
SQL
    log "MySQL root 密码已设置"
else
    warn "root 已是密码认证，跳过改密"
fi

# 建库
mysql -u root -p"$MYSQL_ROOT_PW" <<SQL 2>/dev/null || warn "建库失败，请检查 root 密码"
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SQL
log "数据库 $DB_NAME 已就绪 (端口 $MYSQL_PORT)"

# ========== 5. 配置 Redis ==========
info "5/7 配置 Redis (端口 $REDIS_PORT)..."
REDIS_CNF="/etc/redis/redis.conf"
sed -i -E "s/^#?[[:space:]]*port[[:space:]]+[0-9]+/port $REDIS_PORT/" "$REDIS_CNF"
sed -i -E "s/^#?[[:space:]]*bind[[:space:]].*/bind 127.0.0.1 ::1/" "$REDIS_CNF"
systemctl enable redis-server >/dev/null 2>&1
systemctl restart redis-server
log "Redis 已配置 (端口 $REDIS_PORT, 仅本机)"

# ========== 6. 创建目录和运行用户 ==========
info "6/7 创建部署目录..."
mkdir -p /opt/gamehub/logs
mkdir -p /var/gamehub/uploads/{videos/original,videos/hls,files}
id gamehub &>/dev/null || useradd -r -s /bin/false gamehub
chown -R gamehub:gamehub /opt/gamehub /var/gamehub
log "目录和运行用户 gamehub 已创建"

# ========== 7. 验证 ==========
info "7/7 验证环境..."
echo ""
echo "  Java    : $(java -version 2>&1 | head -1)"
echo "  Maven   : $(mvn -version 2>&1 | head -1)"
echo "  MySQL   : $(mysql --version 2>&1 | head -1)"
echo "  Redis   : $(redis-cli -p $REDIS_PORT ping 2>&1)"
echo "  FFmpeg  : $(ffmpeg -version 2>&1 | head -1)"
echo "  Nginx   : $(nginx -v 2>&1)"

if mysql -u root -p"$MYSQL_ROOT_PW" -e "USE $DB_NAME; SELECT 'DB OK' AS status;" &>/dev/null; then
    log "MySQL 连接正常，库 $DB_NAME 可用"
else
    warn "MySQL 连接异常，请手动检查"
fi

echo ""
echo "=============================================="
echo -e "  ${GREEN}环境安装完成！${NC}"
echo "=============================================="
echo ""
echo "  下一步 (先克隆/拉取项目代码):"
echo "    cd /opt && git clone git@github.com:wxHHHHHHHHH/game-hub.git"
echo "    cd /opt/game-hub && sudo bash scripts/auto_deploy.sh    # 一键部署"
echo "    # 或: sudo bash scripts/deploy.sh                       # systemd 部署(推荐)"
echo ""
