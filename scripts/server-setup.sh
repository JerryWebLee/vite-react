#!/bin/bash
set -euo pipefail

# 服务器初始化脚本
# 在云服务器上运行此脚本来设置部署环境

echo "=== 服务器部署环境初始化 ==="
echo "初始化时间: $(date)"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 root 用户运行此脚本"
    echo "运行: sudo ./scripts/server-setup.sh"
    exit 1
fi

# 创建部署目录
echo "创建部署目录..."
DEPLOY_DIR="/data/deploy"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# 创建 docker-compose.yml 文件
echo "创建 docker-compose.yml 文件..."
cat > docker-compose.yml << 'EOF'
services:
  frontend:
    image: jerryweblee/psylax-fe:latest
    container_name: vite-react-app
    ports:
      - "3081:3081"
    environment:
      - NODE_ENV=production
      - PORT=3081
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3081/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp
      - /var/tmp
      - /var/cache/nginx
      - /var/run
EOF

# 创建 scripts 目录
mkdir -p scripts

# 创建部署脚本
echo "创建部署脚本..."
cat > scripts/server-deploy.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# 服务器部署脚本
# 使用方法: ./scripts/server-deploy.sh [镜像标签]

# 配置
DOCKER_IMAGE="jerryweblee/psylax-fe"
IMAGE_TAG=${1:-latest}
FULL_IMAGE_NAME="${DOCKER_IMAGE}:${IMAGE_TAG}"
SERVICE_NAME="frontend"

echo "=== 开始服务器部署 ==="
echo "部署时间: $(date)"
echo "镜像: $FULL_IMAGE_NAME"
echo "服务名称: $SERVICE_NAME"

# 检查是否在正确的目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误: 当前目录下没有 docker-compose.yml 文件"
    echo "请确保在部署目录下运行此脚本"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker 服务未运行，请启动 Docker"
    exit 1
fi

# 备份当前配置
echo "备份当前配置..."
if [ -f "docker-compose.yml" ]; then
    BACKUP_FILE="docker-compose.yml.backup.$(date +%Y%m%d-%H%M%S)"
    cp docker-compose.yml "$BACKUP_FILE"
    echo "✅ 已备份到: $BACKUP_FILE"
fi

# 更新 docker-compose.yml 中的镜像标签
echo "更新镜像标签..."
if [ "$IMAGE_TAG" != "latest" ]; then
    # 使用 sed 更新镜像标签
    sed -i.bak "s|image: ${DOCKER_IMAGE}:.*|image: ${FULL_IMAGE_NAME}|g" docker-compose.yml
    echo "✅ 已更新镜像标签为: $FULL_IMAGE_NAME"
fi

# 停止当前服务
echo "停止当前服务..."
docker compose stop $SERVICE_NAME || echo "⚠️  服务未运行或停止失败"

# 拉取最新镜像
echo "拉取最新镜像..."
docker compose pull $SERVICE_NAME || {
    echo "❌ 拉取镜像失败"
    echo "尝试回滚配置..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" docker-compose.yml
        echo "✅ 已回滚配置"
    fi
    exit 1
}

# 启动服务
echo "启动服务..."
docker compose up -d --no-deps $SERVICE_NAME || {
    echo "❌ 启动服务失败"
    echo "尝试回滚配置..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" docker-compose.yml
        docker compose up -d --no-deps $SERVICE_NAME || {
            echo "❌ 回滚也失败了"
            exit 1
        }
    fi
    exit 1
}

# 等待服务启动
echo "等待服务启动..."
sleep 15

# 健康检查
echo "执行健康检查..."
for i in {1..6}; do
    if curl -f http://localhost:3081/ > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        break
    else
        if [ $i -eq 6 ]; then
            echo "❌ 健康检查失败，服务可能未正常启动"
            echo "容器日志:"
            docker compose logs --tail=50 $SERVICE_NAME
            exit 1
        fi
        echo "健康检查失败，等待重试... ($i/6)"
        sleep 10
    fi
done

# 清理旧镜像
echo "清理未使用的镜像..."
docker image prune -f || echo "⚠️  镜像清理失败，但继续执行"

# 显示部署结果
echo "=== 部署完成 ==="
echo "服务状态:"
docker compose ps $SERVICE_NAME
echo "容器日志:"
docker compose logs --tail=10 $SERVICE_NAME
echo "✅ 服务器部署成功完成！"

# 显示访问信息
echo ""
echo "🌐 访问信息:"
echo "本地访问: http://localhost:3081"
echo "网络访问: http://$(hostname -I | awk '{print $1}'):3081"
echo "镜像标签: $FULL_IMAGE_NAME"
EOF

# 创建验证脚本
echo "创建验证脚本..."
cat > scripts/deploy-verify.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# 部署验证脚本
SERVICE_NAME="frontend"
HEALTH_CHECK_URL="http://localhost:3081/"
MAX_RETRIES=10
RETRY_INTERVAL=10

echo "=== 开始部署验证 ==="
echo "验证时间: $(date)"
echo "服务名称: $SERVICE_NAME"
echo "健康检查 URL: $HEALTH_CHECK_URL"

# 检查容器是否运行
echo "检查容器状态..."
if ! docker compose ps $SERVICE_NAME | grep -q "Up"; then
    echo "❌ 容器未运行"
    echo "容器状态:"
    docker compose ps $SERVICE_NAME
    exit 1
fi

echo "✅ 容器正在运行"

# 健康检查
echo "执行健康检查..."
for i in $(seq 1 $MAX_RETRIES); do
    echo "尝试 $i/$MAX_RETRIES..."
    
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        break
    else
        if [ $i -eq $MAX_RETRIES ]; then
            echo "❌ 健康检查失败，已达到最大重试次数"
            echo "容器日志:"
            docker compose logs --tail=50 $SERVICE_NAME
            exit 1
        fi
        echo "健康检查失败，等待 $RETRY_INTERVAL 秒后重试..."
        sleep $RETRY_INTERVAL
    fi
done

# 检查资源使用情况
echo "检查资源使用情况..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep $SERVICE_NAME || echo "无法获取资源使用情况"

# 检查端口监听
echo "检查端口监听..."
if netstat -tlnp 2>/dev/null | grep -q ":3081 "; then
    echo "✅ 端口 3081 正在监听"
else
    echo "⚠️  无法确认端口 3081 监听状态"
fi

# 显示最终状态
echo "=== 部署验证完成 ==="
echo "服务状态:"
docker compose ps $SERVICE_NAME
echo "最新日志:"
docker compose logs --tail=10 $SERVICE_NAME
echo "✅ 部署验证成功！"
EOF

# 设置脚本权限
chmod +x scripts/*.sh

# 配置防火墙（如果使用 ufw）
if command -v ufw &> /dev/null; then
    echo "配置防火墙..."
    ufw allow 22/tcp
    ufw allow 3081/tcp
    ufw --force enable
    echo "✅ 防火墙配置完成"
fi

# 显示初始化结果
echo ""
echo "=== 服务器初始化完成 ==="
echo "部署目录: $DEPLOY_DIR"
echo "Docker 版本: $(docker --version)"
echo "Docker Compose 版本: $(docker compose version)"
echo ""
echo "📋 下一步操作:"
echo "1. 在本地构建镜像: ./scripts/build.sh"
echo "2. 在服务器上部署: cd $DEPLOY_DIR && ./scripts/server-deploy.sh"
echo "3. 验证部署: ./scripts/deploy-verify.sh"
echo ""
echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}'):3081" 