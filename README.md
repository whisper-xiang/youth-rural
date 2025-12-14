# 三下乡活动管理系统

大学生暑期"三下乡"社会实践活动管理系统，包含微信小程序前端和 Node.js 后端。

## 项目结构

```
youth-rural/
├── sxs-admin/          # 后端服务 (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── app.js      # 入口文件
│   │   ├── config/     # 配置文件
│   │   ├── middleware/ # 中间件
│   │   ├── routes/     # API 路由
│   │   └── utils/      # 工具函数
│   ├── database/       # 数据库脚本
│   │   ├── schema.sql  # 表结构
│   │   └── test_data.sql # 测试数据
│   └── uploads/        # 上传文件目录
├── sxs-miniapp/        # 微信小程序前端
│   ├── pages/          # 页面
│   ├── utils/          # 工具函数
│   └── app.js          # 小程序入口
├── setup.sh            # 一键初始化脚本
├── start.sh            # 快速启动脚本
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0
- MySQL >= 5.7
- 微信开发者工具

### 一键初始化

```bash
# 1. 克隆项目
git clone <repository-url>
cd youth-rural

# 2. 运行初始化脚本
chmod +x setup.sh
./setup.sh

# 3. 启动后端服务
./start.sh
```

### 手动安装

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE sxs_db DEFAULT CHARACTER SET utf8mb4;"

# 2. 导入表结构和测试数据
mysql -u root -p sxs_db < sxs-admin/database/schema.sql
mysql -u root -p sxs_db < sxs-admin/database/test_data.sql

# 3. 配置后端环境变量
cp sxs-admin/.env.example sxs-admin/.env
# 编辑 .env 文件，填写数据库密码等配置

# 4. 安装依赖并启动
cd sxs-admin
npm install
npm run dev
```

### 小程序开发

1. 打开微信开发者工具
2. 导入项目，选择 `sxs-miniapp` 目录
3. 在「详情」-「本地设置」中勾选「不校验合法域名」
4. 使用测试账号登录

## 测试账号

所有账号密码均为：`123456`

| 角色 | 账号 | 姓名 | 功能权限 |
|------|------|------|----------|
| 学生 | 2021001 | 张三 | 项目申报、进度上传、成果提交 |
| 学生 | 2021002 | 李四 | 项目申报、进度上传、成果提交 |
| 学生 | 2021003 | 王五 | 项目申报、进度上传、成果提交 |
| 教师 | T001 | 李教授 | 查看指导项目、评论进度 |
| 教师 | T002 | 王教授 | 查看指导项目、评论进度 |
| 学院管理员 | CA001 | 经管院管理员 | 学院级项目审批 |
| 学院管理员 | CA002 | 教育院管理员 | 学院级项目审批 |
| 校级管理员 | admin | 系统管理员 | 校级审批、发布通知、系统管理 |
| 评审专家 | E001 | 张专家 | 项目评审打分 |
| 评审专家 | E002 | 李专家 | 项目评审打分 |

## API 接口

后端服务地址：`http://localhost:3000`

### 接口模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `/api/auth` | 登录、微信登录、绑定账号 |
| 用户 | `/api/user` | 用户信息、统计数据 |
| 项目 | `/api/project` | 项目申报 CRUD |
| 审批 | `/api/approval` | 项目审批 |
| 进度 | `/api/progress` | 进度记录、评论 |
| 成果 | `/api/result` | 成果提交、查看 |
| 评优 | `/api/evaluation` | 评审打分 |
| 通知 | `/api/notice` | 通知公告 |
| 上传 | `/api/upload` | 文件上传 |

### 接口认证

除登录接口外，其他接口需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

## 业务流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  项目申报   │ ──▶ │  学院审批   │ ──▶ │  校级审批   │
│  (学生)     │     │ (学院管理员) │     │ (校级管理员) │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  评优评审   │ ◀── │  成果提交   │ ◀── │  进度上传   │
│  (专家)     │     │  (学生)     │     │  (学生)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 技术栈

### 后端
- Node.js + Express
- MySQL + mysql2
- JWT 认证
- Multer 文件上传
- bcryptjs 密码加密

### 前端（小程序）
- 微信小程序原生开发
- WXML + WXSS + JavaScript

## 开发说明

### 目录约定

- 路由文件：`sxs-admin/src/routes/`
- 小程序页面：`sxs-miniapp/pages/`
- API 封装：`sxs-miniapp/utils/api.js`
- 请求工具：`sxs-miniapp/utils/request.js`

### 数据库表

| 表名 | 说明 |
|------|------|
| sys_user | 用户表 |
| sys_college | 学院表 |
| project | 项目表 |
| project_member | 项目成员 |
| approval_record | 审批记录 |
| progress | 进度记录 |
| progress_image | 进度图片 |
| progress_comment | 进度评论 |
| result | 成果表 |
| result_attachment | 成果附件 |
| notice | 通知公告 |
| notice_attachment | 通知附件 |
| evaluation | 评优活动 |
| evaluation_score | 评审打分 |

## License

MIT
