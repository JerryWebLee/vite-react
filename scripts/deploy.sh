#!/bin/bash

# 部署脚本
# 使用方法: ./scripts/deploy.sh [environment]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 默认环境
ENVIRONMENT=${1:-production}
PROJECT_DIR="/opt/vite-react"
BACKUP_DIR="/opt/backups/vite-react"

log_info "开始部署到 $ENVIRONMENT 环境..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份当前版本
if [ -d "$PROJECT_DIR" ]; then
    log_info "备份当前版本..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r $PROJECT_DIR $BACKUP_DIR/$BACKUP_NAME
    log_info "备份完成: $BACKUP_DIR/$BACKUP_NAME"
fi

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码
log_info "拉取最新代码..."
git fetch origin
git reset --hard origin/main

# 安装依赖
log_info "安装依赖..."
pnpm install --frozen-lockfile

# 构建应用
log_info "构建应用..."
pnpm run build

# 停止现有容器
log_info "停止现有容器..."
docker-compose down || true

# 构建新镜像
log_info "构建 Docker 镜像..."
docker-compose build --no-cache

# 启动新容器
log_info "启动新容器..."
docker-compose up -d

# 等待服务启动
log_info "等待服务启动..."
sleep 10

# 健康检查
log_info "执行健康检查..."
for i in {1..30}; do
    if curl -f http://localhost:3081/ > /dev/null 2>&1; then
        log_info "服务启动成功！"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "服务启动失败，回滚到上一个版本..."
        docker-compose down
        rm -rf $PROJECT_DIR
        cp -r $BACKUP_DIR/$BACKUP_NAME $PROJECT_DIR
        cd $PROJECT_DIR
        docker-compose up -d
        exit 1
    fi
    sleep 2
done

# 清理旧镜像
log_info "清理旧镜像..."
docker image prune -f

# 清理旧备份（保留最近5个）
log_info "清理旧备份..."
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm -rf

log_info "部署完成！"
log_info "访问地址: http://localhost:3081" 