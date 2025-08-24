#!/bin/bash
set -euo pipefail

# 回滚脚本
SERVICE_NAME="frontend"
DEPLOY_DIR="/root/deploy"
BACKUP_PREFIX="docker-compose.yml.backup"

echo "=== 开始回滚流程 ==="
echo "回滚时间: $(date)"

# 检查是否在正确的目录
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "❌ 部署目录不存在: $DEPLOY_DIR"
    exit 1
fi

cd "$DEPLOY_DIR"

# 查找最新的备份文件
LATEST_BACKUP=$(ls -t ${BACKUP_PREFIX}.* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 没有找到备份文件"
    exit 1
fi

echo "找到备份文件: $LATEST_BACKUP"

# 停止当前服务
echo "停止当前服务..."
docker-compose stop $SERVICE_NAME || echo "服务未运行或停止失败"

# 恢复备份文件
echo "恢复备份文件..."
cp "$LATEST_BACKUP" docker-compose.yml

# 拉取之前的镜像
echo "拉取之前的镜像..."
docker-compose pull $SERVICE_NAME || {
    echo "❌ 拉取镜像失败"
    exit 1
}

# 启动服务
echo "启动服务..."
docker-compose up -d --no-deps $SERVICE_NAME || {
    echo "❌ 启动服务失败"
    exit 1
}

# 等待服务启动
echo "等待服务启动..."
sleep 15

# 健康检查
echo "执行健康检查..."
for i in {1..5}; do
    if curl -f http://localhost:3081/ > /dev/null 2>&1; then
        echo "✅ 回滚成功！服务正常运行"
        break
    else
        if [ $i -eq 5 ]; then
            echo "❌ 回滚后健康检查失败"
            echo "容器日志:"
            docker-compose logs $SERVICE_NAME
            exit 1
        fi
        echo "健康检查失败，等待重试... ($i/5)"
        sleep 10
    fi
done

echo "=== 回滚完成 ==="
echo "服务状态:"
docker-compose ps $SERVICE_NAME
echo "✅ 回滚成功完成！" 