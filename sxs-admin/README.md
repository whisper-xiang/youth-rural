# 三下乡活动管理系统 - 后端服务

基于 Node.js + Express + MySQL 的后端 API 服务。

## 技术栈

- **运行环境**: Node.js 18+
- **Web 框架**: Express 4.x
- **数据库**: MySQL 8.0
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **文件上传**: multer

## 项目结构

```
sxs-admin/
├── database/
│   ├── schema.sql          # 数据库建表脚本
│   └── README.md           # 数据库设计文档
├── src/
│   ├── app.js              # 应用入口
│   ├── config/
│   │   └── db.js           # 数据库连接配置
│   ├── middleware/
│   │   └── auth.js         # JWT 认证中间件
│   ├── routes/
│   │   ├── auth.js         # 认证接口
│   │   ├── user.js         # 用户接口
│   │   ├── project.js      # 项目申报接口
│   │   ├── approval.js     # 审批管理接口
│   │   ├── progress.js     # 进度跟踪接口
│   │   ├── result.js       # 成果管理接口
│   │   ├── evaluation.js   # 评优管理接口
│   │   ├── notice.js       # 通知公告接口
│   │   └── upload.js       # 文件上传接口
│   └── utils/
│       └── response.js     # 统一响应格式
├── uploads/                # 上传文件目录
├── .env.example            # 环境变量示例
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd sxs-admin
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息
```

### 3. 初始化数据库

```bash
mysql -u root -p < database/schema.sql
```

### 4. 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

服务启动后访问: http://localhost:3000

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

### 响应格式

```json
{
  "code": 0,        // 0 成功，其他为错误码
  "message": "操作成功",
  "data": {}        // 响应数据
}
```

### 接口列表

#### 认证模块 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /login | 用户名密码登录 | 否 |
| POST | /wx-login | 微信小程序登录 | 否 |
| POST | /bind-wx | 绑定微信账号 | 否 |

#### 用户模块 `/api/user`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /info | 获取当前用户信息 | 是 |
| PUT | /info | 更新用户信息 | 是 |
| GET | /stats | 获取用户统计数据 | 是 |
| GET | /colleges | 获取学院列表 | 否 |
| GET | /teachers | 获取教师列表 | 是 |

#### 项目申报 `/api/project`

| 方法 | 路径 | 说明 | 认证 | 权限 |
|------|------|------|------|------|
| GET | /list | 获取项目列表 | 是 | 全部 |
| GET | /detail/:id | 获取项目详情 | 是 | 全部 |
| POST | /create | 创建项目 | 是 | 学生 |
| PUT | /update/:id | 更新项目 | 是 | 学生 |
| POST | /submit/:id | 提交审批 | 是 | 学生 |
| DELETE | /delete/:id | 删除项目 | 是 | 学生 |

#### 审批管理 `/api/approval`

| 方法 | 路径 | 说明 | 认证 | 权限 |
|------|------|------|------|------|
| GET | /list | 获取待审批列表 | 是 | 管理员 |
| POST | /approve/:id | 审批通过 | 是 | 管理员 |
| POST | /reject/:id | 审批驳回 | 是 | 管理员 |

#### 进度跟踪 `/api/progress`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /list | 获取进度列表 | 是 |
| GET | /detail/:id | 获取进度详情 | 是 |
| POST | /create | 创建进度 | 是 |
| POST | /comment/:id | 添加评论 | 是 |
| DELETE | /delete/:id | 删除进度 | 是 |

#### 成果管理 `/api/result`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /list | 获取成果列表 | 是 |
| GET | /my-list | 获取我的成果 | 是 |
| GET | /detail/:id | 获取成果详情 | 是 |
| POST | /create | 创建成果 | 是 |
| POST | /publish/:id | 发布成果 | 是 |
| DELETE | /delete/:id | 删除成果 | 是 |

#### 评优管理 `/api/evaluation`

| 方法 | 路径 | 说明 | 认证 | 权限 |
|------|------|------|------|------|
| GET | /list | 获取评优项目列表 | 是 | 专家/管理员 |
| GET | /detail/:projectId | 获取评优详情 | 是 | 专家/管理员 |
| POST | /score/:projectId | 提交评分 | 是 | 专家 |
| GET | /ranking | 获取排名 | 是 | 管理员 |
| POST | /award/:projectId | 设置获奖等级 | 是 | 管理员 |

#### 通知公告 `/api/notice`

| 方法 | 路径 | 说明 | 认证 | 权限 |
|------|------|------|------|------|
| GET | /list | 获取通知列表 | 是 | 全部 |
| GET | /detail/:id | 获取通知详情 | 是 | 全部 |
| POST | /create | 创建通知 | 是 | 管理员 |
| PUT | /update/:id | 更新通知 | 是 | 管理员 |
| DELETE | /delete/:id | 删除通知 | 是 | 管理员 |
| POST | /favorite/:id | 收藏/取消收藏 | 是 | 全部 |
| GET | /unread-count | 获取未读数量 | 是 | 全部 |

#### 文件上传 `/api/upload`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /file | 单文件上传 | 是 |
| POST | /files | 多文件上传 | 是 |
| POST | /image | 单图片上传 | 是 |
| POST | /images | 多图片上传 | 是 |

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 校级管理员 |
| 2021001 | 123456 | 学生 |
| T001 | 123456 | 指导教师 |
| CA001 | 123456 | 学院管理员 |
| E001 | 123456 | 评审专家 |

## 部署说明

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start src/app.js --name sxs-admin

# 查看日志
pm2 logs sxs-admin

# 重启服务
pm2 restart sxs-admin
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        alias /path/to/sxs-admin/uploads;
    }
}
```
