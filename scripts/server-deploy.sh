#!/bin/bash
set -euo pipefail

# 服务器部署脚本
# 使用方法: ./scripts/server-deploy.sh [镜像标签]

# 配置
DOCKER_IMAGE="jerryweblee/psylax-fe"
IMAGE_TAG=${1:-latest}
FULL_IMAGE_NAME="${DOCKER_IMAGE}:${IMAGE_TAG}"
SERVICE_NAME="frontend"

echo "=== 开始服务器部署 ==="
echo "部署时间: $(date)"
echo "镜像: $FULL_IMAGE_NAME"
echo "服务名称: $SERVICE_NAME"

# 检查是否在正确的目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误: 当前目录下没有 docker-compose.yml 文件"
    echo "请确保在部署目录下运行此脚本"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker 服务未运行，请启动 Docker"
    exit 1
fi

# 备份当前配置
echo "备份当前配置..."
if [ -f "docker-compose.yml" ]; then
    BACKUP_FILE="docker-compose.yml.backup.$(date +%Y%m%d-%H%M%S)"
    cp docker-compose.yml "$BACKUP_FILE"
    echo "✅ 已备份到: $BACKUP_FILE"
fi

# 更新 docker-compose.yml 中的镜像标签
echo "更新镜像标签..."
if [ "$IMAGE_TAG" != "latest" ]; then
    # 使用 sed 更新镜像标签
    sed -i.bak "s|image: ${DOCKER_IMAGE}:.*|image: ${FULL_IMAGE_NAME}|g" docker-compose.yml
    echo "✅ 已更新镜像标签为: $FULL_IMAGE_NAME"
fi

# 停止当前服务
echo "停止当前服务..."
docker compose stop $SERVICE_NAME || echo "⚠️  服务未运行或停止失败"

# 拉取最新镜像
echo "拉取最新镜像..."
docker compose pull $SERVICE_NAME || {
    echo "❌ 拉取镜像失败"
    echo "尝试回滚配置..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" docker-compose.yml
        echo "✅ 已回滚配置"
    fi
    exit 1
}

# 启动服务
echo "启动服务..."
docker compose up -d --no-deps $SERVICE_NAME || {
    echo "❌ 启动服务失败"
    echo "尝试回滚配置..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" docker-compose.yml
        docker compose up -d --no-deps $SERVICE_NAME || {
            echo "❌ 回滚也失败了"
            exit 1
        }
    fi
    exit 1
}

# 等待服务启动
echo "等待服务启动..."
sleep 15

# 健康检查
echo "执行健康检查..."
for i in {1..6}; do
    if curl -f http://localhost:3081/ > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        break
    else
        if [ $i -eq 6 ]; then
            echo "❌ 健康检查失败，服务可能未正常启动"
            echo "容器日志:"
            docker compose logs --tail=50 $SERVICE_NAME
            exit 1
        fi
        echo "健康检查失败，等待重试... ($i/6)"
        sleep 10
    fi
done

# 清理旧镜像
echo "清理未使用的镜像..."
docker image prune -f || echo "⚠️  镜像清理失败，但继续执行"

# 显示部署结果
echo "=== 部署完成 ==="
echo "服务状态:"
docker compose ps $SERVICE_NAME
echo "容器日志:"
docker compose logs --tail=10 $SERVICE_NAME
echo "✅ 服务器部署成功完成！"

# 显示访问信息
echo ""
echo "🌐 访问信息:"
echo "本地访问: http://localhost:3081"
echo "网络访问: http://$(hostname -I | awk '{print $1}'):3081"
echo "镜像标签: $FULL_IMAGE_NAME" 