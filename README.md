# 🎮 GameHub — 游戏团体视频展示平台

> 为游戏小团体打造的专属视频展示网站，支持 B站嵌入 + 本地高清上传 + 用户权限管理

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange)](https://adoptium.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://dev.mysql.com/downloads/)

---

## 📋 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始（本地）](#-快速开始本地)
- [演示账号](#-演示账号)
- [API 概要](#-api-概要)
- [权限系统](#-权限系统)
- [环境切换](#-环境切换)
- [部署指南](#-部署指南)
- [FAQ](#-faq)

---

## ✨ 功能特性

### 📺 视频系统
- **B站视频嵌入** — 输入 BV 号自动拉取封面/标题/简介，iframe 嵌入高画质播放
- **本地高清上传** — 支持 MP4/MOV/MKV/AVI/WebM/FLV，最大 2GB
- **HLS 流式播放** — FFmpeg 自动转码为 m3u8+ts 分段，DPlayer + HLS.js 播放
- **最新/最热排序** — 按发布时间或点赞数排序浏览
- **点赞互动** — 一键点赞/取消，实时更新

### 🔐 用户系统
- **JWT 无状态认证** — HMAC-SHA384 签名，7天有效期
- **三级权限** — ADMIN（管理员）、MEMBER（成员）、VISITOR（游客）
- **BCrypt 密码加密** — 所有密码安全哈希存储
- **自动登录恢复** — 刷新页面保持登录状态

### 👥 管理面板
- **成员管理** — 管理员可添加/删除用户、修改角色
- **内置管理员保护** — 默认 admin 账号不可删除/不可改角色
- **用户列表** — 查看所有注册用户及其角色

### 💬 评论系统
- 视频下方发表评论，自动关联登录用户
- 管理员可删除不当评论
- 本地模式内置演示评论数据

### 🎨 体验
- 深色游戏主题 UI，霓虹渐变点缀
- 响应式布局：桌面3列、平板2列、手机1列
- 演示数据内置，后端不可用时也能预览

---

## 🛠 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **后端框架** | Spring Boot | 3.2.5 | Java Web 快速开发 |
| **安全认证** | Spring Security + jjwt | 0.12.5 | 无状态 JWT 方案 |
| **ORM** | Spring Data JPA / Hibernate | 6.4.4 | 自动建表 + 查询 |
| **数据库** | MySQL | 8.0+ | 主存储 |
| **构建工具** | Maven | 3.9+ | 依赖与打包 |
| **视频转码** | FFmpeg | 5.0+ | HLS 转码（可选） |
| **前端框架** | **原生 HTML/CSS/JS** | — | 零依赖 SPA |
| **视频播放器** | DPlayer + HLS.js | CDN | 自托管播放 |
| **反向代理** | Nginx | 1.24+ | 生产环境 |

---

## 📁 项目结构

```
game-hub/
├── README.md
├── docs/
│   ├── API.md                          # 完整 API 接口文档
│   └── DEPLOY.md                       # 服务器部署详细指南
├── scripts/
│   ├── install_server.sh               # Linux 一键环境安装
│   └── deploy.sh                       # 快速构建部署
├── backend/                            # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/gamehub/
│       │   ├── GameHubApplication.java     # 入口类
│       │   ├── config/
│       │   │   ├── CorsConfig.java         # 跨域（允许所有来源）
│       │   │   ├── DataInitializer.java    # BCrypt 密码初始化默认用户
│       │   │   ├── SecurityConfig.java     # 权限规则配置
│       │   │   └── WebConfig.java          # /uploads/** 静态资源映射
│       │   ├── controller/
│       │   │   ├── AdminController.java    # /api/admin/** 用户管理
│       │   │   ├── AuthController.java     # /api/auth/** 登录认证
│       │   │   ├── CommentController.java  # 评论创建/删除
│       │   │   ├── UploadController.java   # 视频文件上传
│       │   │   └── VideoController.java    # 视频CRUD + 点赞
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   └── LoginResponse.java
│       │   ├── entity/
│       │   │   ├── Comment.java            # 评论实体
│       │   │   ├── User.java               # 用户实体（ADMIN/MEMBER/VISITOR）
│       │   │   └── Video.java              # 视频实体（BILIBILI/LOCAL）
│       │   ├── exception/
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── repository/                 # JPA Repository 接口
│       │   ├── security/
│       │   │   ├── JwtAuthFilter.java       # OncePerRequestFilter
│       │   │   └── JwtUtil.java             # Token 生成/验证
│       │   └── service/
│       │       ├── CommentService.java
│       │       ├── FfmpegService.java       # FFmpeg HLS转码
│       │       ├── UserService.java         # 登录+管理
│       │       └── VideoService.java        # 视频排序+点赞
│       └── resources/
│           ├── application.yml              # 本地配置
│           ├── application-prod.yml         # 生产配置（环境变量）
│           └── data.sql                     # 种子数据
└── frontend/                           # SPA 前端
    ├── index.html                      # 完整 HTML（登录+主应用+弹窗）
    ├── css/
    │   └── style.css                   # 暗色游戏主题（600+行）
    └── js/
        ├── config.js                   # 环境自动检测 + CDN 配置
        ├── api.js                      # HTTP 客户端 + JWT 拦截
        ├── auth.js                     # 认证 + 权限矩阵
        └── app.js                      # 主逻辑（路由/渲染/交互）
```

---

## 🚀 快速开始（本地）

### 前提条件

| 软件 | 版本 | 下载 |
|------|------|------|
| JDK | 17+ | [Eclipse Temurin](https://adoptium.net/) |
| Maven | 3.9+ | [Apache Maven](https://maven.apache.org/) |
| MySQL | 8.0+ | [MySQL Community](https://dev.mysql.com/downloads/) |
| FFmpeg | 5.0+ (可选) | [FFmpeg.org](https://ffmpeg.org/) |

### 1. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS gamehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. 配置数据库密码

编辑 `backend/src/main/resources/application.yml` 第14行：

```yaml
spring:
  datasource:
    password: 你的MySQL密码
```

### 3. 启动后端

```bash
cd backend
mvn spring-boot:run
```

首次启动 Hibernate 自动建表，`DataInitializer` 创建默认用户，`data.sql` 导入演示视频。

### 4. 打开前端

```bash
# 直接用浏览器打开
start frontend/index.html

# 或使用任意 HTTP 服务器
cd frontend
python -m http.server 3000
# 访问 http://localhost:3000
```

> 💡 本地模式下前端自动检测 `file://` 协议，API 指向 `http://localhost:8080/api`。
> 如果后端未启动，前端会使用内置演示数据运行（此时评论/点赞不会持久化）。

---

## 🔑 演示账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 👑 管理员 | `admin` | `admin123` | 全部权限 + 成员管理 |
| 🎮 成员 | `player` | `player123` | 发布视频、评论 |
| 👀 游客 | `visitor` | `visitor123` | 浏览、评论 |

---

## 📡 API 概要

> 完整文档 → [docs/API.md](docs/API.md)

### 认证模块
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 公开 | 登录，返回 JWT |
| GET | `/api/auth/me` | 登录 | 获取当前用户信息 |

### 视频模块
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/videos` | 公开 | 视频列表 `?sort=latest\|hot` |
| GET | `/api/videos/{id}` | 公开 | 视频详情（含评论） |
| POST | `/api/videos` | ADMIN/MEMBER | 发布视频 |
| DELETE | `/api/videos/{id}` | ADMIN | 删除视频 |
| POST | `/api/videos/{id}/like` | 登录 | 点赞 +1 |
| POST | `/api/videos/{id}/unlike` | 登录 | 取消点赞 -1 |

### 评论模块
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/videos/{id}/comments` | 登录 | 发表评论 |
| DELETE | `/api/comments/{id}` | ADMIN | 删除评论 |

### 上传模块
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/upload/video` | ADMIN/MEMBER | 上传视频文件（multipart） |

### 管理模块
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/admin/users` | ADMIN | 用户列表 |
| POST | `/api/admin/users` | ADMIN | 创建用户 |
| PUT | `/api/admin/users/{id}/role` | ADMIN | 修改角色 |
| DELETE | `/api/admin/users/{id}` | ADMIN | 删除用户 |

### 认证方式

```http
Authorization: Bearer <token>
```

---

## 🔐 权限系统

### 角色定义

| 角色 | Spring Security | 说明 |
|------|-----------------|------|
| ADMIN | `ROLE_ADMIN` | 管理员，拥有全部权限 |
| MEMBER | `ROLE_MEMBER` | 正式成员，可发布视频 |
| VISITOR | `ROLE_VISITOR` | 游客，仅浏览和评论 |

### 权限矩阵

| 操作 | 👑 ADMIN | 🎮 MEMBER | 👀 VISITOR | 匿名 |
|------|:---:|:---:|:---:|:---:|
| 浏览视频列表 | ✅ | ✅ | ✅ | ✅ |
| 查看视频详情 | ✅ | ✅ | ✅ | ✅ |
| 点赞/取消 | ✅ | ✅ | ✅ | ❌ |
| 发表评论 | ✅ | ✅ | ✅ | ❌ |
| 发布B站视频 | ✅ | ✅ | ❌ | ❌ |
| 上传本地视频 | ✅ | ✅ | ❌ | ❌ |
| 删除视频 | ✅ | ❌ | ❌ | ❌ |
| 删除评论 | ✅ | ❌ | ❌ | ❌ |
| 管理成员 | ✅ | ❌ | ❌ | ❌ |

---

## 🌐 环境切换

### 后端（Spring Boot Profile）

| Profile | 配置 | 数据库 | 种子数据 |
|---------|------|--------|----------|
| `local`（默认） | `application.yml` | `localhost:3306` | 自动导入 |
| `prod` | `application-prod.yml` | 环境变量注入 | 不导入 |

```bash
# 本地开发
mvn spring-boot:run

# 生产运行
java -jar game-hub.jar --spring.profiles.active=prod
```

### 前端（自动检测）

| 环境 | 检测条件 | API 地址 | 演示数据 |
|------|----------|----------|----------|
| 本地 | `file://` 或 `localhost` | `http://localhost:8080/api` | API不可用时启用 |
| 生产 | 其他域名 | `/api`（Nginx代理） | 不启用 |

编辑 `frontend/js/config.js` 可修改 API 地址。

---

## 🚢 部署指南

### 详细文档 → [docs/DEPLOY.md](docs/DEPLOY.md)

### 快速部署（Linux 服务器）

```bash
# 1. 上传项目到服务器
scp -r game-hub user@server:/opt/

# 2. SSH 登录服务器
ssh user@server

# 3. 安装所有依赖
sudo bash /opt/game-hub/scripts/install_server.sh

# 4. 一键构建部署
sudo bash /opt/game-hub/scripts/deploy.sh
```

### 生产环境变量

```bash
# /etc/gamehub/env.conf
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=gamehub
DB_USERNAME=gamehub_user
DB_PASSWORD=your_secure_password
JWT_SECRET=$(openssl rand -base64 32)
SERVER_PORT=8080
UPLOAD_DIR=/var/gamehub/uploads
```

---

## ❓ FAQ

### Q: 为什么登录显示"用户名或密码错误"？
A: 检查 MySQL 是否运行，确认 `application.yml` 中的密码是否正确。首次启动时 `DataInitializer` 会自动创建默认用户。

### Q: 上传视频失败？
A: 
1. 检查文件大小是否超过 2GB
2. 检查格式是否为支持的格式（MP4/MOV/AVI/MKV/WebM/FLV/WMV/M4V）
3. 确保以 ADMIN 或 MEMBER 身份登录

### Q: HLS 转码不工作？
A: 需要安装 FFmpeg。未安装时，上传的视频将以原始格式直接提供服务。

### Q: 如何修改默认管理员密码？
A: 登录后需要通过数据库直接修改，或通过 API 创建一个新的管理员账号。

### Q: 前端页面打开空白？
A: 检查浏览器控制台的错误信息。确保所有 JS 文件路径正确。本地模式需允许 CORS 请求。

---

## 📝 License

MIT — 仅供学习和团体内部使用
