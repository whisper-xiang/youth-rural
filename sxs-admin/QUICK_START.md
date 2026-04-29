# 🚀 三下乡活动管理系统快速启动指南

## 📋 概述

本指南提供在新机器上快速部署和启动三下乡活动管理系统的完整流程。通过一键脚本，您可以快速初始化所有演示数据，立即体验完整系统功能。

## 🎯 系统特点

- ✅ **一键部署**: 单条命令完成所有数据初始化
- ✅ **丰富数据**: 覆盖所有业务场景的演示数据
- ✅ **多角色体验**: 学生、教师、管理员、专家等完整角色
- ✅ **真实场景**: 基于实际业务流程的数据设计
- ✅ **无草稿状态**: 学生页面显示更实用的项目状态

## 🛠️ 环境要求

### 基础环境
- **Node.js** >= 14.0.0
- **MySQL** >= 5.7.0
- **npm** 或 **yarn**

### 数据库配置
- **主机**: localhost
- **端口**: 3306
- **用户**: root
- **密码**: 123456 (已自动配置)
- **数据库**: sxs_db

## 🚀 快速启动

### 方法一：一键快速启动（推荐）

```bash
# 1. 克隆项目
git clone <项目地址>
cd sxs-admin

# 2. 安装依赖
npm install

# 3. 一键初始化所有数据
npm run quick-start

# 4. 启动后端服务
npm start
```

### 方法二：分步初始化

```bash
# 1. 初始化基础演示数据
npm run init-demo

# 2. 初始化学生专项数据
npm run init-student

# 3. 启动服务
npm start
```

### 方法三：手动执行SQL

```bash
# 1. 连接数据库
mysql -u root -p123456

# 2. 创建数据库
CREATE DATABASE sxs_db;
USE sxs_db;

# 3. 执行基础数据脚本
source database/demo_data_correct.sql;

# 4. 执行学生数据脚本
source database/student_demo_data.sql;
```

## 📊 数据覆盖范围

### 🎓 学生账号 (2021001 / 123456)

**项目数据** (6个项目，无草稿状态)：
- ⏳ **待审核** (1个): 社区志愿服务活动
- ✅ **学院已审** (1个): 传统文化进校园
- 🎯 **已立项** (1个): 环保意识调研 (含进度和成果)
- ❌ **已驳回** (1个): 科技创新实践 (含驳回原因)
- 🔄 **已撤回** (1个): 健康生活推广
- 🏁 **已结项** (1个): 乡村振兴调研实践

**关联数据**：
- 👥 **项目成员**: 每个项目3名成员
- 📋 **审批记录**: 完整的审批流程
- 📊 **进度记录**: 已立项项目的详细进度
- 📁 **成果材料**: 报告、图片、附件等
- 💬 **系统消息**: 项目状态变更通知

### 👨‍🏫 教师账号 (t_wang / 123456)
- 查看指导的项目
- 添加项目反馈
- 查看项目成果

### 🏢 管理员账号
- **学院管理员** (ca_jg / 123456): 审批本学院项目
- **校级管理员** (admin / 123456): 审批所有项目、管理评优

### 👨‍⚖️ 评审专家账号 (e_chen / 123456)
- 参与项目评优
- 查看评优结果

## 📱 前端启动

```bash
# 1. 进入小程序目录
cd ../sxs-miniapp

# 2. 使用微信开发者工具打开项目
# 配置项目AppID（测试号即可）
# 启动项目
```

## 🎭 演示场景

### 学生端演示路径
1. **首页** → 查看功能模块
2. **我的项目** → 查看6个不同状态的项目
3. **项目详情** → 查看项目信息、成员、进度
4. **项目工作台** → 查看进度、成果、反馈
5. **评优榜单** → 查看优秀项目公示

### 管理员演示路径
1. **审批管理** → 审批待审核项目
2. **审批详情** → 查看详情并审批
3. **通知发布** → 发布系统通知

## 🔧 脚本说明

### 核心脚本文件

| 文件 | 功能 | 说明 |
|------|------|------|
| `scripts/quick_start.js` | 一键启动脚本 | 执行所有初始化步骤 |
| `scripts/init_demo_data.js` | 基础数据初始化 | 初始化系统基础演示数据 |
| `scripts/init_student_demo.js` | 学生数据初始化 | 为学生创建丰富项目数据 |
| `database/demo_data_correct.sql` | 基础数据SQL | 基于schema的完整数据 |
| `database/student_demo_data.sql` | 学生数据SQL | 学生专项项目数据 |

### NPM 脚本命令

```json
{
  "quick-start": "node scripts/quick_start.js",    // 一键启动
  "init-demo": "node scripts/init_demo_data.js",  // 基础数据
  "init-student": "node scripts/init_student_demo.js", // 学生数据
  "start": "node src/app.js",                      // 启动服务
  "dev": "nodemon src/app.js"                      // 开发模式
}
```

## 🔍 验证部署

### 后端验证
```bash
# 测试接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"2021001","password":"123456"}'

# 查看项目列表
curl -X GET http://localhost:3000/api/project/list \
  -H "Authorization: Bearer <token>"
```

### 前端验证
1. 登录学生账号 2021001
2. 查看"我的项目"页面
3. 确认显示6个不同状态的项目
4. 点击项目查看详情

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查MySQL服务
   brew services start mysql  # macOS
   sudo systemctl start mysql # Linux
   
   # 检查密码配置
   mysql -u root -p123456
   ```

2. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   
   # 杀死进程
   kill -9 <PID>
   ```

3. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **数据初始化失败**
   ```bash
   # 手动执行SQL
   mysql -u root -p123456 sxs_db < database/demo_data_correct.sql
   mysql -u root -p123456 sxs_db < database/student_demo_data.sql
   ```

### 日志查看

```bash
# 查看详细日志
npm run quick-start 2>&1 | tee init.log

# 查看数据库日志
tail -f /usr/local/var/mysql/mysql.log  # macOS
tail -f /var/log/mysql/error.log       # Linux
```

## 📚 相关文档

- [DEMO_DATA_SUCCESS.md](./DEMO_DATA_SUCCESS.md) - 演示数据详细说明
- [DEMO_DATA_README.md](./DEMO_DATA_README.md) - 数据初始化指南
- [../sxs-miniapp/README.md](../sxs-miniapp/README.md) - 前端文档

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

**快速启动命令**: `npm run quick-start`

**更新时间**: 2026年6月23日  
**版本**: v2.0.0  
**状态**: ✅ 可用
