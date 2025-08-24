#!/bin/bash

# 服务器修复脚本
# 解决权限和初始化问题

echo "=== 服务器修复脚本 ==="
echo "修复时间: $(date)"

# 加载配置
if [ -f "scripts/load-config.sh" ]; then
    source scripts/load-config.sh
else
    echo "❌ 配置加载脚本不存在"
    exit 1
fi

# 检查配置
if [ -z "${SERVER_HOST:-}" ] || [ -z "${SERVER_USER:-}" ]; then
    echo "❌ 服务器配置不完整"
    exit 1
fi

echo "服务器: $SERVER_USER@$SERVER_HOST"
echo ""

# 第一步：上传并运行初始化脚本
echo "🚀 第一步：服务器初始化"
echo "========================"

echo "上传初始化脚本到服务器..."
scp scripts/server-setup.sh "$SERVER_USER@$SERVER_HOST:/tmp/"

echo "在服务器上运行初始化脚本..."
ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
    echo "开始服务器初始化..."
    
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        echo "使用 sudo 运行初始化脚本..."
        sudo chmod +x /tmp/server-setup.sh
        sudo /tmp/server-setup.sh
    else
        echo "以 root 用户运行初始化脚本..."
        chmod +x /tmp/server-setup.sh
        /tmp/server-setup.sh
    fi
    
    echo "初始化完成！"
EOF

# 第二步：修复权限问题
echo ""
echo "🚀 第二步：修复权限问题"
echo "========================"

echo "修复部署目录权限..."
ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
    echo "修复 /data/deploy 目录权限..."
    
    # 创建部署目录（如果不存在）
    sudo mkdir -p /data/deploy
    
    # 设置正确的权限
    sudo chown -R $USER:$USER /data/deploy
    sudo chmod -R 755 /data/deploy
    
    # 确保当前用户可以访问
    sudo usermod -aG docker $USER
    
    echo "权限修复完成！"
EOF

# 第三步：验证修复结果
echo ""
echo "🚀 第三步：验证修复结果"
echo "========================"

echo "验证服务器状态..."
ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
    echo "检查部署目录:"
    ls -la /data/deploy
    
    echo ""
    echo "检查 Docker 状态:"
    sudo systemctl status docker --no-pager
    
    echo ""
    echo "检查部署脚本:"
    ls -la /data/deploy/scripts/ 2>/dev/null || echo "部署脚本目录不存在"
    
    echo ""
    echo "检查 Docker Compose:"
    docker compose version
EOF

echo ""
echo "✅ 服务器修复完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 运行配置检查: ./scripts/check-config.sh"
echo "2. 执行部署: ./scripts/deploy.sh" 