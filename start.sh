#!/bin/bash

# ============================================
# 三下乡活动管理系统 - 快速启动脚本
# ============================================

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/sxs-admin"

echo ""
echo -e "${BLUE}启动三下乡活动管理系统后端服务...${NC}"
echo ""

cd "$BACKEND_DIR"

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "未找到 .env 配置文件，请先运行 setup.sh 初始化项目"
    exit 1
fi

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 启动服务
echo -e "${GREEN}后端服务启动中...${NC}"
echo "访问地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev
