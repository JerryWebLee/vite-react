#!/bin/bash
set -euo pipefail

# 一键部署脚本
# 使用方法: ./scripts/deploy-all.sh [镜像标签]

# 配置
DOCKER_IMAGE="jerryweblee/psylax-fe"
IMAGE_TAG=${1:-latest}
FULL_IMAGE_NAME="${DOCKER_IMAGE}:${IMAGE_TAG}"

echo "=== 一键部署流程 ==="
echo "部署时间: $(date)"
echo "镜像: $FULL_IMAGE_NAME"

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用默认标签: latest"
    echo "如需使用自定义标签，请运行: ./scripts/deploy-all.sh YOUR_TAG"
fi

# 第一步：本地构建
echo ""
echo "🚀 第一步：本地构建"
echo "=================="

# 检查是否在项目根目录
if [ ! -f "Dockerfile" ]; then
    echo "❌ 错误: 当前目录下没有 Dockerfile"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 运行构建脚本
if [ -f "scripts/build-platform.sh" ]; then
    ./scripts/build-platform.sh
elif [ -f "scripts/build-multi-platform.sh" ]; then
    ./scripts/build-multi-platform.sh
elif [ -f "scripts/build-simple.sh" ]; then
    echo "⚠️  使用单平台构建脚本（可能遇到平台兼容性问题）"
    ./scripts/build-simple.sh "$IMAGE_TAG"
else
    echo "❌ 构建脚本不存在"
    exit 1
fi

# 第二步：服务器部署
echo ""
echo "🚀 第二步：服务器部署"
echo "=================="

# 尝试加载配置文件
if [ -f "scripts/load-config.sh" ]; then
    source scripts/load-config.sh
fi

# 检查是否有服务器配置
if [ -z "${SERVER_HOST:-}" ] || [ -z "${SERVER_USER:-}" ]; then
    echo "⚠️  未配置服务器信息"
    echo ""
    
    # 检查配置文件是否存在
    if [ -f "deploy.config" ]; then
        echo "📋 发现配置文件 deploy.config，但配置可能不完整"
        echo "当前配置:"
        if [ -f "deploy.config" ]; then
            grep -E "^(SERVER_HOST|SERVER_USER)=" deploy.config 2>/dev/null || echo "  未找到服务器配置"
        fi
        echo ""
    fi
    
    echo "📋 请创建或更新配置文件 deploy.config"
    echo "创建方法:"
    echo "   cp deploy.config.example deploy.config"
    echo "   vim deploy.config"
    echo ""
    echo "📋 配置文件内容示例:"
    echo "   SERVER_HOST=your-server-ip"
    echo "   SERVER_USER=your-username"
    echo ""
    echo "📋 或者设置环境变量:"
    echo "   export SERVER_HOST=your-server-ip"
    echo "   export SERVER_USER=your-username"
    echo ""
    echo "📋 服务器部署命令:"
    echo "   ssh YOUR_USER@YOUR_SERVER"
    echo "   cd /data/deploy"
    echo "   ./scripts/server-deploy.sh $IMAGE_TAG"
    echo ""
    echo "✅ 本地构建完成！"
    echo "镜像: $FULL_IMAGE_NAME"
    exit 0
fi

# 通过 SSH 在服务器上运行部署脚本
echo "连接到服务器: $SERVER_USER@$SERVER_HOST"
echo "在服务器上运行部署脚本..."

ssh "$SERVER_USER@$SERVER_HOST" << EOF
    # 使用 sudo 访问 /data/deploy 目录
    sudo mkdir -p /data/deploy
    
    # 检查脚本是否存在
    if sudo test -f "/data/deploy/scripts/server-deploy.sh"; then
        echo "✅ 找到部署脚本"
        sudo chmod +x /data/deploy/scripts/server-deploy.sh
        sudo bash -c "cd /data/deploy && PATH=\$PATH:/usr/local/bin:/usr/bin ./scripts/server-deploy.sh $IMAGE_TAG"
    else
        echo "❌ 服务器上未找到部署脚本"
        echo "请先运行: ./scripts/fix-server.sh"
        exit 1
    fi
EOF

# 检查部署结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 一键部署成功完成！"
    echo "镜像: $FULL_IMAGE_NAME"
    echo "服务器: $SERVER_USER@$SERVER_HOST"
    echo "访问地址: http://$SERVER_HOST:3081"
else
    echo ""
    echo "❌ 服务器部署失败"
    echo "请检查服务器连接和部署脚本"
    exit 1
fi 