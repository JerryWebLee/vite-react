#!/bin/bash

# 配置检查脚本
# 用于验证部署配置是否正确

echo "=== 配置检查 ==="
echo "检查时间: $(date)"
echo ""

# 检查配置文件是否存在
if [ ! -f "deploy.config" ]; then
    echo "❌ 配置文件不存在: deploy.config"
    echo ""
    echo "📋 创建配置文件:"
    echo "   cp deploy.config.example deploy.config"
    echo "   vim deploy.config"
    echo ""
    echo "📋 配置文件内容示例:"
    echo "   SERVER_HOST=your-server-ip"
    echo "   SERVER_USER=your-username"
    echo "   DOCKER_IMAGE=jerryweblee/psylax-fe"
    echo "   DOCKER_TAG=latest"
    echo "   DEPLOY_PORT=3081"
    echo "   DEPLOY_DIR=/data/deploy"
    exit 1
fi

echo "✅ 配置文件存在: deploy.config"
echo ""

# 加载配置
if [ -f "scripts/load-config.sh" ]; then
    source scripts/load-config.sh
else
    echo "❌ 配置加载脚本不存在: scripts/load-config.sh"
    exit 1
fi

echo ""

# 检查必要配置项
echo "📋 配置项检查:"

# 检查服务器配置
if [ -n "${SERVER_HOST:-}" ]; then
    echo "✅ SERVER_HOST: $SERVER_HOST"
else
    echo "❌ SERVER_HOST: 未设置"
fi

if [ -n "${SERVER_USER:-}" ]; then
    echo "✅ SERVER_USER: $SERVER_USER"
else
    echo "❌ SERVER_USER: 未设置"
fi

# 检查 Docker 配置
if [ -n "${DOCKER_IMAGE:-}" ]; then
    echo "✅ DOCKER_IMAGE: $DOCKER_IMAGE"
else
    echo "❌ DOCKER_IMAGE: 未设置"
fi

if [ -n "${DOCKER_TAG:-}" ]; then
    echo "✅ DOCKER_TAG: $DOCKER_TAG"
else
    echo "❌ DOCKER_TAG: 未设置"
fi

# 检查部署配置
if [ -n "${DEPLOY_PORT:-}" ]; then
    echo "✅ DEPLOY_PORT: $DEPLOY_PORT"
else
    echo "❌ DEPLOY_PORT: 未设置"
fi

if [ -n "${DEPLOY_DIR:-}" ]; then
    echo "✅ DEPLOY_DIR: $DEPLOY_DIR"
else
    echo "❌ DEPLOY_DIR: 未设置"
fi

echo ""

# 检查服务器连接
if [ -n "${SERVER_HOST:-}" ] && [ -n "${SERVER_USER:-}" ]; then
    echo "🔍 检查服务器连接..."
    if ssh -o ConnectTimeout=5 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        echo "✅ 服务器连接正常: $SERVER_USER@$SERVER_HOST"
    else
        echo "❌ 无法连接到服务器: $SERVER_USER@$SERVER_HOST"
        echo "请检查："
        echo "1. 服务器地址是否正确"
        echo "2. SSH 密钥是否配置"
        echo "3. 网络连接是否正常"
    fi
else
    echo "⚠️  跳过服务器连接检查（配置不完整）"
fi

echo ""
echo "=== 配置检查完成 ===" 