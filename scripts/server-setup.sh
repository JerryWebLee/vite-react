#!/bin/bash

# 服务器初始化脚本
# 在云服务器上运行此脚本来设置部署环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    log_error "请使用 root 用户运行此脚本"
    exit 1
fi

log_info "开始设置服务器环境..."

# 更新系统
log_info "更新系统包..."
apt update && apt upgrade -y

# 安装必要的软件
log_info "安装必要的软件..."
apt install -y curl wget git docker.io docker-compose nginx

# 启动并启用 Docker 服务
log_info "配置 Docker 服务..."
systemctl start docker
systemctl enable docker

# 创建部署用户
log_info "创建部署用户..."
useradd -m -s /bin/bash deploy || true
usermod -aG docker deploy

# 创建项目目录
log_info "创建项目目录..."
mkdir -p /opt/vite-react
mkdir -p /opt/backups/vite-react
chown -R deploy:deploy /opt/vite-react
chown -R deploy:deploy /opt/backups

# 配置 SSH 密钥（如果存在）
if [ -f "/root/.ssh/id_rsa.pub" ]; then
    log_info "配置 SSH 密钥..."
    mkdir -p /home/deploy/.ssh
    cp /root/.ssh/id_rsa.pub /home/deploy/.ssh/authorized_keys
    chown -R deploy:deploy /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chmod 600 /home/deploy/.ssh/authorized_keys
fi

# 配置防火墙
log_info "配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3081/tcp
ufw --force enable

# 配置 Nginx 反向代理（可选）
log_info "配置 Nginx 反向代理..."
cat > /etc/nginx/sites-available/vite-react << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名

    location / {
        proxy_pass http://localhost:3081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/vite-react /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

# 安装 Node.js 和 pnpm
log_info "安装 Node.js 和 pnpm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 切换到部署用户并克隆项目
log_info "克隆项目..."
su - deploy << 'EOF'
cd /opt
if [ ! -d "vite-react" ]; then
    git clone https://github.com/JerryWebLee/vite-react.git
fi
cd vite-react
pnpm install
EOF

log_info "服务器环境设置完成！"
log_info "请确保："
log_info "1. 在 GitHub 仓库设置中添加以下 Secrets："
log_info "   - SERVER_HOST: 您的服务器 IP 地址"
log_info "   - SERVER_USERNAME: deploy"
log_info "   - SERVER_SSH_KEY: 您的 SSH 私钥"
log_info "   - SERVER_PORT: 22"
log_info "2. 将您的域名替换到 Nginx 配置中"
log_info "3. 配置 SSL 证书（推荐使用 Let's Encrypt）" 