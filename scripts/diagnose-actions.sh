#!/bin/bash

# GitHub Actions 诊断脚本
echo "=== GitHub Actions 诊断工具 ==="
echo "诊断时间: $(date)"
echo ""

# 检查当前目录
echo "1. 检查当前目录..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ 找到 GitHub Actions 工作流文件"
else
    echo "❌ 未找到 GitHub Actions 工作流文件"
fi

if [ -f ".github/workflows/test.yml" ]; then
    echo "✅ 找到测试工作流文件"
else
    echo "❌ 未找到测试工作流文件"
fi

echo ""

# 检查 Git 状态
echo "2. 检查 Git 状态..."
if [ -d ".git" ]; then
    echo "✅ Git 仓库已初始化"
    
    # 获取远程仓库信息
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    if [ -n "$REMOTE_URL" ]; then
        echo "✅ 远程仓库: $REMOTE_URL"
        
        # 检查是否是 GitHub 仓库
        if [[ $REMOTE_URL == *"github.com"* ]]; then
            echo "✅ 这是 GitHub 仓库"
        else
            echo "⚠️  这不是 GitHub 仓库"
        fi
    else
        echo "❌ 未配置远程仓库"
    fi
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    if [ -n "$CURRENT_BRANCH" ]; then
        echo "✅ 当前分支: $CURRENT_BRANCH"
    else
        echo "❌ 无法获取当前分支"
    fi
else
    echo "❌ 当前目录不是 Git 仓库"
fi

echo ""

# 检查 Docker 状态
echo "3. 检查 Docker 状态..."
if command -v docker &> /dev/null; then
    echo "✅ Docker 已安装"
    
    # 检查 Docker 服务状态
    if docker info &> /dev/null; then
        echo "✅ Docker 服务正在运行"
        
        # 检查镜像
        if docker images | grep -q "jerryweblee/psylax-fe"; then
            echo "✅ 找到项目镜像"
        else
            echo "⚠️  未找到项目镜像"
        fi
    else
        echo "❌ Docker 服务未运行"
    fi
else
    echo "❌ Docker 未安装"
fi

echo ""

# 检查 Docker Compose
echo "4. 检查 Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose 已安装"
    
    if [ -f "docker-compose.yml" ]; then
        echo "✅ 找到 docker-compose.yml 文件"
        
        # 检查服务状态
        if docker-compose ps &> /dev/null; then
            echo "✅ Docker Compose 配置有效"
        else
            echo "❌ Docker Compose 配置有问题"
        fi
    else
        echo "❌ 未找到 docker-compose.yml 文件"
    fi
else
    echo "❌ Docker Compose 未安装"
fi

echo ""

# 检查脚本文件
echo "5. 检查部署脚本..."
SCRIPTS=("scripts/local-deploy.sh" "scripts/deploy-verify.sh" "scripts/rollback.sh" "deploy.sh")

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "✅ $script (可执行)"
        else
            echo "⚠️  $script (需要执行权限)"
        fi
    else
        echo "❌ $script (不存在)"
    fi
done

echo ""

# 提供建议
echo "6. 建议和下一步操作..."
echo ""

if [ -f ".github/workflows/test.yml" ]; then
    echo "📋 测试 GitHub Actions:"
    echo "   1. 推送代码到 main 分支"
    echo "   2. 或手动触发测试工作流"
    echo "   3. 检查 Actions 标签页"
    echo ""
fi

echo "📋 如果 GitHub Actions 仍然有问题:"
echo "   1. 检查账户计费状态: https://github.com/settings/billing"
echo "   2. 检查 Actions 使用情况: https://github.com/settings/billing/actions"
echo "   3. 使用本地部署: ./scripts/local-deploy.sh"
echo "   4. 设置自托管 Runner: 参考 docs/SELF_HOSTED_RUNNER.md"
echo ""

echo "📋 本地部署命令:"
echo "   # 构建和推送镜像"
echo "   docker build -t jerryweblee/psylax-fe:latest ."
echo "   docker push jerryweblee/psylax-fe:latest"
echo ""
echo "   # 在服务器上部署"
echo "   ./scripts/local-deploy.sh latest"
echo ""

echo "=== 诊断完成 ===" 