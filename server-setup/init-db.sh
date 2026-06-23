#!/bin/bash
# ============================================
# GameHub — 初始化数据库
# 用法: bash init-db.sh
# 前提: MySQL 容器已运行（商城项目的 mall-mysql）
# ============================================
set -e

MYSQL_PASS="${MYSQL_PASSWORD:-Mall@2024!}"

echo "📦 创建 gamehub 数据库..."
docker exec mall-mysql mysql -u root -p"${MYSQL_PASS}" -e "
  CREATE DATABASE IF NOT EXISTS gamehub
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
" 2>/dev/null && echo "✅ gamehub 数据库已创建" || echo "⚠️  可能已存在"
