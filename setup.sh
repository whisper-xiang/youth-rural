#!/bin/bash

# ============================================
# 三下乡活动管理系统 - 一键初始化脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/sxs-admin"
MINIAPP_DIR="$PROJECT_ROOT/sxs-miniapp"

# 默认配置
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="sxs_db"
DB_USER="root"
DB_PASS=""
JWT_SECRET="sxs_jwt_secret_key_2025"

echo ""
echo "============================================"
echo "   三下乡活动管理系统 - 一键初始化"
echo "============================================"
echo ""

# ============================================
# 1. 检查系统环境
# ============================================
info "检查系统环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    error "未安装 Node.js，请先安装 Node.js (推荐 v18+)"
fi
NODE_VERSION=$(node -v)
info "Node.js 版本: $NODE_VERSION"

# 检查 npm
if ! command -v npm &> /dev/null; then
    error "未安装 npm"
fi
NPM_VERSION=$(npm -v)
info "npm 版本: $NPM_VERSION"

# 检查 MySQL
if ! command -v mysql &> /dev/null; then
    warning "未检测到 mysql 命令行工具"
    warning "请确保 MySQL 服务已安装并运行"
fi

success "系统环境检查通过"
echo ""

# ============================================
# 2. 配置数据库连接
# ============================================
info "配置数据库连接..."

read -p "请输入 MySQL 主机地址 [默认: localhost]: " input
DB_HOST=${input:-$DB_HOST}

read -p "请输入 MySQL 端口 [默认: 3306]: " input
DB_PORT=${input:-$DB_PORT}

read -p "请输入 MySQL 用户名 [默认: root]: " input
DB_USER=${input:-$DB_USER}

read -sp "请输入 MySQL 密码: " input
echo ""
DB_PASS=${input:-$DB_PASS}

read -p "请输入数据库名称 [默认: sxs_db]: " input
DB_NAME=${input:-$DB_NAME}

echo ""
info "数据库配置:"
info "  主机: $DB_HOST:$DB_PORT"
info "  用户: $DB_USER"
info "  数据库: $DB_NAME"
echo ""

# ============================================
# 3. 测试数据库连接
# ============================================
info "测试数据库连接..."

if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1" &> /dev/null; then
    success "数据库连接成功"
else
    error "数据库连接失败，请检查配置"
fi

# ============================================
# 4. 创建数据库
# ============================================
info "创建数据库 $DB_NAME..."

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

success "数据库创建成功"

# ============================================
# 5. 初始化数据库表结构
# ============================================
info "初始化数据库表结构..."

if [ -f "$BACKEND_DIR/database/schema.sql" ]; then
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKEND_DIR/database/schema.sql" 2>/dev/null
    success "表结构初始化成功"
else
    warning "未找到 schema.sql，跳过表结构初始化"
fi

# ============================================
# 6. 导入测试数据
# ============================================
read -p "是否导入测试数据? [Y/n]: " input
if [[ ! "$input" =~ ^[Nn]$ ]]; then
    info "导入测试数据..."
    if [ -f "$BACKEND_DIR/database/test_data.sql" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKEND_DIR/database/test_data.sql" 2>/dev/null
        success "测试数据导入成功"
    else
        warning "未找到 test_data.sql，跳过测试数据导入"
    fi
fi

# ============================================
# 7. 创建后端 .env 配置文件
# ============================================
info "创建后端配置文件..."

cat > "$BACKEND_DIR/.env" << EOF
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

# JWT 配置
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# 微信小程序配置 (需要替换为真实值)
WX_APPID=your_appid
WX_SECRET=your_secret
EOF

success "后端配置文件创建成功"

# ============================================
# 8. 安装后端依赖
# ============================================
info "安装后端依赖..."

cd "$BACKEND_DIR"
npm install

success "后端依赖安装成功"

# ============================================
# 9. 创建上传目录
# ============================================
info "创建上传目录..."

mkdir -p "$BACKEND_DIR/uploads/images"
mkdir -p "$BACKEND_DIR/uploads/files"
mkdir -p "$BACKEND_DIR/uploads/progress"
mkdir -p "$BACKEND_DIR/uploads/results"
mkdir -p "$BACKEND_DIR/uploads/notices"

success "上传目录创建成功"

# ============================================
# 10. 完成
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}   初始化完成！${NC}"
echo "============================================"
echo ""
echo "测试账号 (密码均为 123456):"
echo "  学生: 2021001, 2021002, 2021003"
echo "  教师: T001, T002, T003"
echo "  学院管理员: CA001, CA002, CA003"
echo "  校级管理员: admin"
echo "  评审专家: E001, E002, E003"
echo ""
echo "启动后端服务:"
echo "  cd $BACKEND_DIR"
echo "  npm run dev"
echo ""
echo "后端服务地址: http://localhost:3000"
echo ""
echo "小程序开发:"
echo "  使用微信开发者工具打开 $MINIAPP_DIR"
echo "  在「详情」-「本地设置」中勾选「不校验合法域名」"
echo ""
