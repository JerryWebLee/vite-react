#!/bin/bash

# 部署脚本
set -e

# 配置变量
IMAGE_NAME="vite-react-app"
IMAGE_TAG="latest"
CONTAINER_NAME="vite-react-app"
PORT="3081"

echo "🚀 开始部署 React 应用..."

# 构建Docker镜像
echo "📦 构建Docker镜像..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# 停止并删除旧容器（如果存在）
echo "🛑 停止旧容器..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# 运行新容器
echo "▶️  启动新容器..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${PORT}:${PORT} \
  ${IMAGE_NAME}:${IMAGE_TAG}

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 10

# 检查容器状态
echo "🔍 检查容器状态..."
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "✅ 容器启动成功！"
    echo "🌐 应用访问地址: http://localhost:${PORT}"
else
    echo "❌ 容器启动失败！"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

# 清理未使用的镜像
echo "🧹 清理未使用的镜像..."
docker image prune -f

echo "🎉 部署完成！" 