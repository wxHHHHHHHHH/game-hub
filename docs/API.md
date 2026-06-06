# 📡 GameHub API 接口文档

> Base URL: `http://localhost:8080/api`（本地）或 `/api`（生产 Nginx 代理）

---

## 目录

- [通用说明](#通用说明)
- [1. 认证模块](#1-认证模块)
- [2. 视频模块](#2-视频模块)
- [3. 评论模块](#3-评论模块)
- [4. 上传模块](#4-上传模块)
- [5. 管理模块（ADMIN）](#5-管理模块admin)
- [错误码说明](#错误码说明)
- [数据模型](#数据模型)

---

## 通用说明

### 认证方式（需要登录的接口）

在请求头中携带 JWT Token：

```http
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json
```

Token 通过登录接口获取，有效期 7 天。

### 权限说明

| 角色 | Spring Security Role | 说明 |
|------|---------------------|------|
| ADMIN | `ROLE_ADMIN` | 完全控制 |
| MEMBER | `ROLE_MEMBER` | 可发布视频 |
| VISITOR | `ROLE_VISITOR` | 只读+评论 |

### 通用响应格式

**成功响应：**
```json
{
  "id": 1,
  "title": "视频标题",
  ...
}
```

**错误响应：**
```json
{
  "error": "错误描述信息"
}
```

HTTP 状态码：`200` 成功，`400` 参数错误，`401` 未认证，`403` 权限不足，`500` 服务器错误。

---

## 1. 认证模块

### 1.1 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应** `200`：
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "userId": 1,
  "username": "admin",
  "displayName": "Admin",
  "role": "ADMIN",
  "avatarColor": "#ff00e5"
}
```

**失败响应** `401`：
```json
{
  "error": "用户名或密码错误"
}
```

### 1.2 获取当前用户信息

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**成功响应** `200`：
```json
{
  "userId": 1,
  "username": "admin",
  "displayName": "Admin",
  "role": "ADMIN"
}
```

**失败响应** `401`：
```json
{
  "error": "未登录"
}
```

---

## 2. 视频模块

### 2.1 获取视频列表

```http
GET /api/videos?sort=latest
GET /api/videos?sort=hot
```

- `sort=latest`（默认）：按发布时间降序
- `sort=hot`：按点赞数降序

**权限**：公开（无需登录）

**成功响应** `200`：
```json
[
  {
    "id": 6,
    "title": "年度集锦 — 2024 最精彩的100个瞬间",
    "description": "整理了一整年的搞笑、高光、翻车瞬间...",
    "bilibiliBv": "BV1xx411c7mD",
    "game": "综合集锦",
    "thumbnailUrl": "https://picsum.photos/seed/highlight/640/360",
    "videoType": "BILIBILI",
    "videoUrl": null,
    "uploaderId": 1,
    "likes": 89,
    "createdAt": "2024-12-31 23:59:00",
    "comments": [
      {
        "id": 301,
        "author": "游客",
        "authorId": 3,
        "content": "闪现撞墙那块我反复观看了二十遍，笑死",
        "createdAt": "2024-12-21 00:15:00"
      }
    ]
  }
]
```

### 2.2 获取视频详情

```http
GET /api/videos/{id}
```

**权限**：公开

**成功响应** `200`：返回单个 Video 对象（含评论列表）

**失败响应** `400`：
```json
{
  "error": "视频不存在"
}
```

### 2.3 发布视频

```http
POST /api/videos
Authorization: Bearer <token>
Content-Type: application/json
```

**B站视频示例**：
```json
{
  "title": "新视频标题",
  "bilibiliBv": "BV1xx411c7mD",
  "game": "CS2",
  "description": "视频描述",
  "thumbnailUrl": "https://example.com/cover.jpg",
  "videoType": "BILIBILI"
}
```

**本地视频示例**：
```json
{
  "title": "本地视频标题",
  "bilibiliBv": "LOCAL_1717000000",
  "game": "英雄联盟",
  "description": "本地录制的视频",
  "videoType": "LOCAL",
  "videoUrl": "/uploads/videos/hls/hls_xxx/index.m3u8"
}
```

**权限**：ADMIN 或 MEMBER

**成功响应** `200`：返回创建的 Video 对象

### 2.4 删除视频

```http
DELETE /api/videos/{id}
Authorization: Bearer <token>
```

**权限**：ADMIN

**成功响应** `200`：
```json
{
  "message": "视频已删除"
}
```

> 注意：删除视频会级联删除该视频下所有评论。

### 2.5 点赞视频

```http
POST /api/videos/{id}/like
Authorization: Bearer <token>
```

**权限**：任何登录用户

**成功响应** `200`：
```json
{
  "message": "点赞成功",
  "likes": 90
}
```

### 2.6 取消点赞

```http
POST /api/videos/{id}/unlike
Authorization: Bearer <token>
```

**权限**：任何登录用户

**成功响应** `200`：
```json
{
  "message": "取消点赞",
  "likes": 89
}
```

> likes 最小值不会低于 0。

---

## 3. 评论模块

### 3.1 发表评论

```http
POST /api/videos/{videoId}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "author": "老张",
  "content": "这条视频太棒了！"
}
```

**权限**：任何登录用户

**成功响应** `200`：返回创建的 Comment 对象

### 3.2 删除评论

```http
DELETE /api/comments/{id}
Authorization: Bearer <token>
```

**权限**：ADMIN

**成功响应** `200`：
```json
{
  "message": "评论已删除"
}
```

---

## 4. 上传模块

### 4.1 上传视频文件

```http
POST /api/upload/video
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: (binary video file)
```

**权限**：ADMIN 或 MEMBER

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `file` | File | 视频文件，最大 2GB |

**支持的格式**：MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V

**成功响应（有 FFmpeg）** `200`：
```json
{
  "message": "视频已上传并转码为 HLS 流",
  "videoType": "LOCAL",
  "videoUrl": "/uploads/videos/hls/hls_abc123/index.m3u8",
  "originalName": "my_video.mp4"
}
```

**成功响应（无 FFmpeg）** `200`：
```json
{
  "message": "视频已上传（未安装FFmpeg，使用原始文件）",
  "videoType": "LOCAL",
  "videoUrl": "/uploads/videos/original/abc123.mp4",
  "originalName": "my_video.mp4"
}
```

**失败响应** `400`：
```json
{
  "error": "不支持的视频格式，支持: mp4, mov, avi, mkv, webm, flv"
}
```

> **流程**：先调此接口上传文件获取 `videoUrl`，再调 `POST /api/videos` 创建视频实体。

---

## 5. 管理模块（ADMIN）

> 所有接口需要 ADMIN 角色。

### 5.1 获取用户列表

```http
GET /api/admin/users
Authorization: Bearer <token>
```

**成功响应** `200`：
```json
[
  {
    "id": 1,
    "username": "admin",
    "displayName": "Admin",
    "role": "ADMIN",
    "createdAt": "2024-12-01 00:00:00"
  },
  {
    "id": 2,
    "username": "player",
    "displayName": "老张",
    "role": "MEMBER",
    "createdAt": "2024-12-01 00:00:00"
  }
]
```

> 密码字段 `@JsonIgnore` 不会返回。

### 5.2 创建用户

```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newplayer",
  "password": "pass123",
  "displayName": "新成员",
  "role": "MEMBER"
}
```

**参数**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | String | ✅ | 用户名（唯一） |
| `password` | String | ✅ | 明文密码（自动 BCrypt 加密） |
| `displayName` | String | ✅ | 显示名称 |
| `role` | String | ✅ | `ADMIN` / `MEMBER` / `VISITOR` |

**成功响应** `200`：
```json
{
  "message": "用户创建成功",
  "userId": 4,
  "username": "newplayer",
  "displayName": "新成员",
  "role": "MEMBER"
}
```

**失败响应** `400`：
```json
{
  "error": "用户名已存在: newplayer"
}
```

### 5.3 修改用户角色

```http
PUT /api/admin/users/{id}/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**成功响应** `200`：
```json
{
  "message": "角色更新成功",
  "userId": 2,
  "role": "ADMIN"
}
```

> 内置 admin 用户不可修改角色。

### 5.4 删除用户

```http
DELETE /api/admin/users/{id}
Authorization: Bearer <token>
```

**成功响应** `200`：
```json
{
  "message": "用户已删除"
}
```

> 内置 admin 用户不可删除。

### 5.5 获取统计信息

```http
GET /api/admin/stats
Authorization: Bearer <token>
```

**成功响应** `200`：
```json
{
  "userCount": 3
}
```

---

## 错误码说明

| HTTP 状态码 | 含义 | 常见场景 |
|------------|------|---------|
| 200 | 成功 | 正常返回数据 |
| 400 | 请求参数错误 | 缺少必填字段、用户名重复、格式不支持 |
| 401 | 未认证 | Token 过期/无效、未登录 |
| 403 | 权限不足 | 游客尝试发布视频、非 ADMIN 删除 |
| 500 | 服务器内部错误 | 数据库连接失败、文件存储错误 |

---

## 数据模型

### Video（视频）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 主键 |
| `title` | String(255) | 视频标题 |
| `description` | TEXT | 视频描述 |
| `bilibiliBv` | String(20) | B站 BV 号（LOCAL类型时使用占位值） |
| `game` | String(50) | 游戏名称 |
| `thumbnailUrl` | String(500) | 封面图片 URL |
| `videoType` | String(20) | `BILIBILI` 或 `LOCAL` |
| `videoUrl` | String(500) | 本地视频的 HLS/文件路径 |
| `uploaderId` | Long | 上传者用户 ID |
| `likes` | int | 点赞数（默认 0） |
| `createdAt` | DateTime | 创建时间 |
| `comments` | List\<Comment\> | 关联评论列表 |

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 主键 |
| `username` | String(50) | 用户名（唯一） |
| `password` | String | BCrypt 加密存储 |
| `displayName` | String(50) | 显示名称 |
| `role` | Enum | ADMIN / MEMBER / VISITOR |
| `avatarUrl` | String(200) | 头像 URL（可选） |
| `createdAt` | DateTime | 注册时间 |

### Comment（评论）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 主键 |
| `video` | Video | 关联视频（ManyToOne） |
| `author` | String(100) | 评论者显示名 |
| `authorId` | Long | 评论者用户 ID |
| `content` | TEXT | 评论内容 |
| `createdAt` | DateTime | 评论时间 |
