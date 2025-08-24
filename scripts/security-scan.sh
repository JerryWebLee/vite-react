#!/bin/bash

# Docker镜像安全扫描脚本

set -e

echo "🔍 开始Docker镜像安全扫描..."

# 检查是否安装了trivy
if ! command -v trivy &> /dev/null; then
    echo "❌ Trivy未安装，请先安装Trivy: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
    exit 1
fi

# 构建镜像名称
IMAGE_NAME="vite-react-app"
TAG="latest"

# 构建Docker镜像
echo "🏗️  构建Docker镜像..."
docker build -t ${IMAGE_NAME}:${TAG} .

# 使用Trivy扫描镜像
echo "🔍 使用Trivy扫描镜像安全漏洞..."
trivy image --severity HIGH,CRITICAL ${IMAGE_NAME}:${TAG}

# 检查扫描结果
if [ $? -eq 0 ]; then
    echo "✅ 镜像安全扫描完成，未发现高危漏洞"
else
    echo "⚠️  发现安全漏洞，请检查上述报告"
    exit 1
fi

echo "🎉 安全扫描完成！" 