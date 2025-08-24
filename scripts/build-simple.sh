#!/bin/bash
set -euo pipefail

# 简化版本的本地构建脚本
# 使用方法: ./scripts/build-simple.sh [镜像标签]

# 配置
DOCKER_IMAGE="jerryweblee/psylax-fe"
IMAGE_TAG=${1:-latest}

# 检查参数
if [ $# -eq 0 ]; then
    IMAGE_TAG="latest"
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "使用方法: $0 [镜像标签]"
    echo "示例:"
    echo "  $0              # 使用 latest 标签"
    echo "  $0 v1.0.0       # 使用 v1.0.0 标签"
    echo "  $0 20241201     # 使用时间戳标签"
    exit 0
fi

FULL_IMAGE_NAME="${DOCKER_IMAGE}:${IMAGE_TAG}"

echo "=== 开始简化版本构建 ==="
echo "构建时间: $(date)"
echo "镜像: $FULL_IMAGE_NAME"

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker 服务未运行，请启动 Docker"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "Dockerfile" ]; then
    echo "❌ 错误: 当前目录下没有 Dockerfile"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 创建临时 Dockerfile 来避免所有脚本问题
echo "创建临时 Dockerfile..."
cat > Dockerfile.simple << 'EOF'
# 多阶段构建 - 构建阶段
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 更新系统包并安装安全更新
RUN apk update && apk upgrade --no-cache

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm@latest

# 安装依赖（完全跳过所有脚本）
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段 - 使用nginx
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx/docker.conf /etc/nginx/conf.d/default.conf

# 创建必要的目录
RUN mkdir -p /var/cache/nginx /var/run

# 暴露端口
EXPOSE 3081

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# 构建镜像
echo "构建 Docker 镜像..."
docker build --platform linux/amd64 -f Dockerfile.simple -t "$FULL_IMAGE_NAME" . || {
    echo "❌ Docker 构建失败"
    rm -f Dockerfile.simple
    exit 1
}

# 清理临时文件
rm -f Dockerfile.simple

# 同时打上 latest 标签（如果使用了自定义标签）
if [ "$IMAGE_TAG" != "latest" ]; then
    echo "添加 latest 标签..."
    docker tag "$FULL_IMAGE_NAME" "${DOCKER_IMAGE}:latest" || {
        echo "❌ 添加 latest 标签失败"
        exit 1
    }
fi

# 验证构建的镜像
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

echo "✅ 简化版本构建和推送成功完成！"
echo "镜像: $FULL_IMAGE_NAME"

# 显示镜像信息
echo ""
echo "📦 镜像信息:"
docker images | grep "$DOCKER_IMAGE" | grep -E "($IMAGE_TAG|latest)" 