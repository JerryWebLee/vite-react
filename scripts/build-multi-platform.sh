#!/bin/bash

# 多平台构建脚本
# 支持在 macOS 上构建适用于 Linux 服务器的镜像

set -euo pipefail

echo "=== 多平台构建脚本 ==="
echo "构建时间: $(date)"

# 加载配置
if [ -f "scripts/load-config.sh" ]; then
    source scripts/load-config.sh
else
    echo "❌ 配置加载脚本不存在"
    exit 1
fi

# 检查配置
if [ -z "${DOCKER_IMAGE:-}" ] || [ -z "${DOCKER_TAG:-}" ]; then
    echo "❌ Docker 配置不完整"
    echo "请检查 deploy.config 文件"
    exit 1
fi

FULL_IMAGE_NAME="${DOCKER_IMAGE}:${DOCKER_TAG}"

echo "镜像: $FULL_IMAGE_NAME"
echo "目标平台: linux/amd64 (适用于大多数云服务器)"
echo ""

# 检查 Docker Buildx 是否可用
if ! docker buildx version &> /dev/null; then
    echo "❌ Docker Buildx 不可用"
    echo "请确保 Docker Desktop 已更新到最新版本"
    exit 1
fi

# 创建临时 Dockerfile
echo "创建临时 Dockerfile..."
cat > Dockerfile.multi << 'EOF'
# 多阶段构建 - 适用于 Linux AMD64
FROM --platform=linux/amd64 node:22-alpine AS builder

WORKDIR /app

# 安装系统依赖
RUN apk update && apk upgrade --no-cache

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm@latest

# 安装依赖（跳过脚本以避免 preinstall 问题）
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM --platform=linux/amd64 nginx:alpine

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx/docker.conf /etc/nginx/conf.d/default.conf

# 创建必要的目录
RUN mkdir -p /var/cache/nginx /var/run

# 暴露端口
EXPOSE 3081

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# 构建镜像
echo "构建多平台 Docker 镜像..."
docker buildx build \
    --platform linux/amd64 \
    -f Dockerfile.multi \
    -t "$FULL_IMAGE_NAME" \
    --load \
    . || {
    echo "❌ Docker 构建失败"
    rm -f Dockerfile.multi
    exit 1
}

# 推送镜像
echo "推送镜像到仓库..."
docker push "$FULL_IMAGE_NAME" || {
    echo "❌ 镜像推送失败"
    exit 1
}

# 清理临时文件
rm -f Dockerfile.multi

echo ""
echo "✅ 多平台构建成功完成！"
echo "镜像: $FULL_IMAGE_NAME"
echo "平台: linux/amd64"
echo ""
echo "📦 镜像信息:"
docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 