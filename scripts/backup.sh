#!/bin/bash
# ============================================================
# GameHub - 自动备份脚本
# 备份 MySQL 数据库 + 上传文件，保留最近 N 天
# ============================================================
# 用法:
#   sudo bash /opt/game-hub/scripts/backup.sh
#
# 定时任务（每天凌晨 3 点自动备份）:
#   sudo crontab -e
#   加入一行:
#   0 3 * * * /opt/game-hub/scripts/backup.sh >> /var/log/gamehub-backup.log 2>&1
# ============================================================
set -u

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

# ========== 配置 ==========
DB_NAME="gamehub"
DB_HOST="localhost"
DB_PORT="35087"
DB_USER="root"
DB_PASS="Root@123456"
UPLOAD_DIR="/var/gamehub/uploads"
BACKUP_DIR="/var/backups/gamehub"
KEEP_DAYS=7

# 若服务器上有独立环境配置文件，则读取其中的数据库配置（与 auto_deploy.sh 一致）
if [ -f /etc/gamehub/env.conf ]; then
    # shellcheck disable=SC1091
    source /etc/gamehub/env.conf 2>/dev/null || true
    DB_NAME="${DB_NAME:-gamehub}"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-35087}"
    DB_USER="${DB_USERNAME:-$DB_USER}"
    DB_PASS="${DB_PASSWORD:-$DB_PASS}"
fi

STAMP=$(date '+%Y%m%d_%H%M%S')
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "=============================================="
echo "  GameHub 备份  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="

mkdir -p "$BACKUP_DIR" || { err "无法创建备份目录 $BACKUP_DIR"; exit 1; }

# 1. 备份数据库
DB_FILE="$TMPDIR/gamehub_db_${STAMP}.sql.gz"
log "备份数据库 $DB_NAME ..."
if MYSQL_PWD="$DB_PASS" mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" \
        --single-transaction --default-character-set=utf8mb4 "$DB_NAME" 2>/dev/null \
        | gzip > "$DB_FILE" && [ -s "$DB_FILE" ]; then
    log "数据库备份完成: $(du -h "$DB_FILE" | cut -f1)"
else
    err "数据库备份失败（请检查数据库连接配置）"
fi

# 2. 备份上传文件
FILES_TAR="$TMPDIR/gamehub_uploads_${STAMP}.tar.gz"
if [ -d "$UPLOAD_DIR" ]; then
    log "备份上传文件 ..."
    tar -czf "$FILES_TAR" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")" 2>/dev/null
    log "上传文件备份完成: $(du -h "$FILES_TAR" | cut -f1)"
else
    warn "上传目录不存在，跳过: $UPLOAD_DIR"
fi

# 3. 打包成一个文件
FINAL="$BACKUP_DIR/gamehub_backup_${STAMP}.tar.gz"
tar -czf "$FINAL" -C "$TMPDIR" . 2>/dev/null
log "备份包: $FINAL ($(du -h "$FINAL" | cut -f1))"

# 4. 清理过期备份
DELETED=$(find "$BACKUP_DIR" -name "gamehub_backup_*.tar.gz" -mtime +"$KEEP_DAYS" -delete -print 2>/dev/null | wc -l)
log "清理过期备份: $DELETED 个"

echo "=============================================="
log "备份完成"
echo "=============================================="
