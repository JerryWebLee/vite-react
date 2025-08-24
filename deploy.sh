#!/bin/bash
set -euo pipefail  # 启用严格错误处理

# 获取传递的镜像标签，如果没有则使用默认值
IMAGE_TAG=${1:-latest}
DOCKER_IMAGE="jerryweblee/psylax-fe"
FULL_IMAGE_NAME="${DOCKER_IMAGE}:${IMAGE_TAG}"

echo "=== 开始构建和推送 Docker 镜像 ==="
echo "镜像名称: $FULL_IMAGE_NAME"
echo "构建时间: $(date)"

# 先构建镜像并打标签
echo "构建 Docker 镜像..."
docker build -t "$FULL_IMAGE_NAME" . || {
  echo "❌ Docker 构建失败"
  exit 1
}

# 同时打上 latest 标签（如果使用了自定义标签）
if [ "$IMAGE_TAG" != "latest" ]; then
  echo "添加 latest 标签..."
  docker tag "$FULL_IMAGE_NAME" "${DOCKER_IMAGE}:latest" || {
    echo "❌ 添加 latest 标签失败"
    exit 1
  }
fi

# 检查镜像是否存在
echo "验证构建的镜像..."
docker images | grep "$DOCKER_IMAGE" | grep "$IMAGE_TAG" || {
  echo "❌ 构建的镜像不存在"
  exit 1
}

# 推送镜像
echo "推送镜像到仓库..."
docker push "$FULL_IMAGE_NAME" || {
  echo "❌ Docker 推送失败"
  exit 1
}

# 如果使用了自定义标签，也推送 latest 标签
if [ "$IMAGE_TAG" != "latest" ]; then
  echo "推送 latest 标签..."
  docker push "${DOCKER_IMAGE}:latest" || {
    echo "❌ 推送 latest 标签失败"
    exit 1
  }
fi

echo "✅ 镜像构建和推送成功完成！"
echo "镜像: $FULL_IMAGE_NAME"
