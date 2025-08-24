#!/bin/bash
set -euo pipefail

# 便捷部署脚本
# 自动加载配置文件并执行部署

echo "=== 便捷部署脚本 ==="
echo "部署时间: $(date)"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录下运行此脚本"
    exit 1
fi

# 加载配置文件
if [ -f "scripts/load-config.sh" ]; then
    source scripts/load-config.sh
else
    echo "❌ 配置加载脚本不存在"
    exit 1
fi

# 检查配置
if [ -z "${SERVER_HOST:-}" ] || [ -z "${SERVER_USER:-}" ]; then
    echo "❌ 服务器配置不完整"
    echo ""
    
    # 检查配置文件是否存在
    if [ -f "deploy.config" ]; then
        echo "📋 发现配置文件 deploy.config，但配置可能不完整"
        echo "当前配置:"
        grep -E "^(SERVER_HOST|SERVER_USER)=" deploy.config 2>/dev/null || echo "  未找到服务器配置"
        echo ""
        echo "请检查并更新 deploy.config 文件"
    else
        echo "📋 配置文件 deploy.config 不存在"
        echo "请创建配置文件:"
        echo "   cp deploy.config.example deploy.config"
        echo "   vim deploy.config"
    fi
    exit 1
fi

echo "✅ 配置加载成功"
echo "服务器: $SERVER_USER@$SERVER_HOST"
echo ""

# 执行一键部署
echo "🚀 开始执行一键部署..."
./scripts/deploy-all.sh "$@" 