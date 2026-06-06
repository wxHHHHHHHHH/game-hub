# 🚢 GameHub 服务器部署指南

> 从零开始在 Linux 服务器上部署 GameHub 的完整步骤。

---

## 📋 目录

- [服务器环境要求](#服务器环境要求)
- [方案一：一键安装脚本](#方案一一键安装脚本)
- [方案二：手动安装](#方案二手动安装)
- [数据库配置](#数据库配置)
- [项目构建与部署](#项目构建与部署)
- [Nginx 反向代理配置](#nginx-反向代理配置)
- [Systemd 服务配置](#systemd-服务配置)
- [安全加固建议](#安全加固建议)
- [维护命令](#维护命令)

---

## 服务器环境要求

| 项目 | 推荐配置 |
|------|----------|
| **操作系统** | Ubuntu 22.04 LTS / CentOS 8+ / Debian 12 |
| **CPU** | 2 核及以上 |
| **内存** | 4 GB 及以上 |
| **磁盘** | 20 GB 及以上（视频文件需要更多） |
| **网络** | 公网 IP + 域名（可选） |

### 所需软件

| 软件 | 版本 | 用途 |
|------|------|------|
| OpenJDK | 17 | 运行 Spring Boot 后端 |
| MySQL | 8.0+ | 数据库 |
| Maven | 3.9+ | 构建项目（可与JDK一起装） |
| FFmpeg | 5.0+ | HLS 视频转码（可选） |
| Nginx | 1.24+ | 反向代理 + 前端静态文件 |

---

## 方案一：一键安装脚本

项目提供了自动化安装脚本，支持 Ubuntu/Debian 和 CentOS/RHEL：

```bash
# 1. 上传项目到服务器
scp -r E:/game-hub user@your-server:/opt/

# 2. SSH 登录
ssh user@your-server

# 3. 运行安装脚本（需要 sudo 权限）
cd /opt/game-hub
sudo bash scripts/install_server.sh
```

脚本会自动完成：
1. 更新系统包管理器
2. 安装 OpenJDK 17
3. 安装 MySQL 8.0 并创建 gamehub 数据库
4. 安装 Maven 3.9
5. 安装 FFmpeg（可选）
6. 安装 Nginx

---

## 方案二：手动安装

### 1. 安装 JDK 17

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y openjdk-17-jdk

# CentOS/RHEL
sudo dnf install -y java-17-openjdk-devel

# 验证
java -version
# 输出：openjdk version "17.0.x" ...
```

### 2. 安装 MySQL 8.0

```bash
# Ubuntu/Debian
sudo apt install -y mysql-server-8.0

# CentOS/RHEL
sudo dnf install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 安全初始化（Ubuntu 默认已做）
sudo mysql_secure_installation
```

### 3. 安装 Maven（可选，也可本地构建后上传 JAR）

```bash
# Ubuntu/Debian
sudo apt install -y maven

# CentOS/RHEL
sudo dnf install -y maven

# 验证
mvn --version
```

### 4. 安装 FFmpeg（可选，用于 HLS 转码）

```bash
# Ubuntu/Debian
sudo apt install -y ffmpeg

# CentOS/RHEL（需要 EPEL）
sudo dnf install -y epel-release
sudo dnf install -y ffmpeg

# 验证
ffmpeg -version
```

### 5. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo dnf install -y nginx

sudo systemctl enable nginx
```

---

## 数据库配置

### 创建数据库和用户

```sql
-- 登录 MySQL
sudo mysql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS gamehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（生产环境推荐）
CREATE USER 'gamehub'@'127.0.0.1' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON gamehub.* TO 'gamehub'@'127.0.0.1';
FLUSH PRIVILEGES;

EXIT;
```

### 环境变量配置

创建文件 `/etc/gamehub/env.conf`：

```bash
# /etc/gamehub/env.conf
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=gamehub
DB_USERNAME=gamehub
DB_PASSWORD=StrongPassword123!

# JWT 密钥（务必修改！用以下命令生成）
# openssl rand -base64 32
JWT_SECRET=$(openssl rand -base64 32)

SERVER_PORT=8080
UPLOAD_DIR=/var/gamehub/uploads
```

---

## 项目构建与部署

### 方式一：服务器上构建

```bash
cd /opt/game-hub/backend
mvn clean package -DskipTests

# JAR 包位于 target/game-hub-1.0.0.jar
```

### 方式二：本地构建后上传

```bash
# 在本地机器上
cd E:\game-hub\backend
mvn clean package -DskipTests

# 上传到服务器
scp target/game-hub-1.0.0.jar user@server:/opt/gamehub/
```

### 部署目录结构

```
/opt/gamehub/
├── game-hub-1.0.0.jar          # 后端 JAR
├── frontend/                    # 前端静态文件
│   ├── index.html
│   ├── css/
│   └── js/
├── logs/                        # 应用日志
│   └── app.log
└── scripts/
    └── start.sh

/var/gamehub/
└── uploads/                     # 上传的视频文件
    └── videos/
        ├── original/            # 原始文件
        └── hls/                 # HLS 转码文件
```

### 创建上传目录

```bash
sudo mkdir -p /var/gamehub/uploads/videos/original
sudo mkdir -p /var/gamehub/uploads/videos/hls
sudo mkdir -p /opt/gamehub/logs

# 设置权限
sudo useradd -r -s /bin/false gamehub 2>/dev/null || true
sudo chown -R gamehub:gamehub /var/gamehub /opt/gamehub
```

---

## Nginx 反向代理配置

### 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/gamehub
```

```nginx
# /etc/nginx/sites-available/gamehub
server {
    listen 80;
    server_name your-domain.com;  # 改为你的域名或 IP

    # 前端静态文件
    root /opt/gamehub/frontend;
    index index.html;

    # 上传文件（大文件静态服务）
    location /uploads/ {
        alias /var/gamehub/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 允许跨域（DPlayer 需要）
        add_header Access-Control-Allow-Origin *;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 大文件上传超时
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 2048m;
    }

    # 前端 SPA 路由（所有非文件请求回退到 index.html）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json text/css application/javascript;
    gzip_min_length 1000;
}
```

### 启用站点

```bash
# 删除默认站点
sudo rm -f /etc/nginx/sites-enabled/default

# 启用 GameHub
sudo ln -sf /etc/nginx/sites-available/gamehub /etc/nginx/sites-enabled/

# 检查配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 配置 HTTPS（Let's Encrypt，可选）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## Systemd 服务配置

### 创建服务文件

```bash
sudo nano /etc/systemd/system/gamehub.service
```

```ini
[Unit]
Description=GameHub Backend Service
Documentation=https://github.com/your/gamehub
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=gamehub
Group=gamehub
WorkingDirectory=/opt/gamehub

# 从配置文件加载环境变量
EnvironmentFile=/etc/gamehub/env.conf

# JVM 参数优化
ExecStart=/usr/bin/java \
  -Xms512m -Xmx1024m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Djava.awt.headless=true \
  -jar /opt/gamehub/game-hub-1.0.0.jar \
  --spring.profiles.active=prod

# 日志输出
StandardOutput=append:/opt/gamehub/logs/app.log
StandardError=append:/opt/gamehub/logs/error.log

# 自动重启
Restart=always
RestartSec=10

# 安全加固
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/var/gamehub/uploads /opt/gamehub/logs

[Install]
WantedBy=multi-user.target
```

### 启用服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable gamehub
sudo systemctl start gamehub

# 查看状态
sudo systemctl status gamehub

# 查看日志
sudo journalctl -u gamehub -f
```

---

## 安全加固建议

### 1. JWT 密钥

**务必修改！** 使用随机生成的长密钥：

```bash
openssl rand -base64 32
```

将结果写入 `/etc/gamehub/env.conf` 的 `JWT_SECRET`。

### 2. MySQL 安全

```sql
-- 删除匿名用户
DELETE FROM mysql.user WHERE User='';

-- 禁止远程 root 登录
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- 刷新权限
FLUSH PRIVILEGES;
```

### 3. 防火墙

```bash
# 只开放必要端口
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 80/tcp       # HTTP
sudo ufw allow 443/tcp      # HTTPS
sudo ufw deny 8080/tcp      # 禁止外部访问后端端口
sudo ufw enable
```

> 后端端口 8080 只应被本地 Nginx 访问，不对外开放。

### 4. 文件上传安全

- Nginx 已限制上传最大 2GB（`client_max_body_size 2048m`）
- 后端只允许视频文件格式
- 上传文件存储在 `/var/gamehub/uploads/`（不在 Web 根目录）

---

## 维护命令

### 日常管理

```bash
# 重启后端
sudo systemctl restart gamehub

# 查看后端日志
tail -f /opt/gamehub/logs/app.log

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 检查磁盘空间
df -h /var/gamehub/uploads
```

### 数据库备份

```bash
# 备份
mysqldump -u gamehub -p gamehub > /opt/backups/gamehub_$(date +%Y%m%d_%H%M%S).sql

# 恢复
mysql -u gamehub -p gamehub < /opt/backups/gamehub_20250101_120000.sql

# 设置定时备份（crontab）
0 3 * * * mysqldump -u gamehub -p'StrongPassword123!' gamehub > /opt/backups/gamehub_$(date +\%Y\%m\%d).sql
```

### 视频文件清理

```bash
# 查看上传文件大小
du -sh /var/gamehub/uploads/*

# 清理超过30天的原始文件（保留HLS转码后的）
find /var/gamehub/uploads/videos/original -type f -mtime +30 -delete

# 清理孤儿HLS目录（没有对应数据库记录的情况，需谨慎）
# find /var/gamehub/uploads/videos/hls -type d -empty -delete
```

### 更新部署

```bash
# 1. 停止服务
sudo systemctl stop gamehub

# 2. 备份旧版本
cp /opt/gamehub/game-hub-1.0.0.jar /opt/gamehub/backup/

# 3. 构建新版本（本地）或从服务器构建
cd /opt/game-hub/backend
git pull
mvn clean package -DskipTests

# 4. 复制 JAR
cp target/game-hub-1.0.0.jar /opt/gamehub/

# 5. 更新前端文件
cp -r ../frontend/* /opt/gamehub/frontend/

# 6. 启动服务
sudo systemctl start gamehub

# 7. 检查状态
sudo systemctl status gamehub
tail -f /opt/gamehub/logs/app.log
```

---

## 故障排查

### 后端启动失败

```bash
# 查看详细日志
sudo journalctl -u gamehub -n 50 --no-pager

# 检查数据库连接
mysql -u gamehub -p -h 127.0.0.1 -e "SELECT 1"

# 检查端口占用
sudo ss -tlnp | grep 8080

# 手动启动测试
sudo -u gamehub java -jar /opt/gamehub/game-hub-1.0.0.jar --spring.profiles.active=prod
```

### Nginx 502 Bad Gateway

```bash
# 检查后端是否运行
sudo systemctl status gamehub

# 检查 Nginx 错误日志
sudo tail -50 /var/log/nginx/error.log
```

### 视频上传失败

```bash
# 检查上传目录权限
ls -la /var/gamehub/uploads/videos/

# 检查磁盘空间
df -h

# 检查 FFmpeg 是否可用
ffmpeg -version

# 检查 Nginx 上传大小限制
grep client_max_body_size /etc/nginx/sites-enabled/gamehub
```
