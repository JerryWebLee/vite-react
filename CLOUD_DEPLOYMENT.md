# 云服务部署指南

## 部署场景选择

### 1. 单应用部署（推荐）

如果您的云服务器只部署这一个前端应用，使用 `docker-compose.prod.yml`：

```bash
# 部署命令
docker-compose -f docker-compose.prod.yml up -d

# 查看状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f frontend
```

**优势：**

- 配置简单，易于维护
- 资源占用少
- 部署快速
- 适合小型项目

### 2. 多服务部署

如果需要在同一台服务器上部署多个服务，使用 `docker-compose.yml`：

```bash
# 部署所有服务
docker-compose up -d

# 只部署前端
docker-compose up -d frontend
```

**适用场景：**

- 前后端分离但部署在同一服务器
- 需要数据库、缓存等服务
- 需要反向代理（Nginx）

## 云服务配置建议

### 1. 安全配置

生产环境建议添加以下安全配置：

```yaml
services:
  frontend:
    # ... 其他配置
    security_opt:
      - no-new-privileges:true # 防止容器获取新权限
    read_only: true # 只读文件系统
    tmpfs: # 临时文件系统
      - /tmp
      - /var/tmp
    user: "1000:1000" # 非 root 用户运行
```

### 2. 资源限制

根据云服务器配置调整资源限制：

```yaml
deploy:
  resources:
    limits:
      memory: 512M # 根据服务器内存调整
      cpus: "0.5" # 根据 CPU 核心数调整
    reservations:
      memory: 256M
      cpus: "0.25"
```

### 3. 网络配置

**单应用部署：** 不需要自定义网络 **多服务部署：** 使用自定义网络隔离

```yaml
# 只在多服务时使用
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 不同云服务商的配置

### 阿里云 ECS

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 部署应用
cd /root/deploy
docker-compose -f docker-compose.prod.yml up -d
```

### 腾讯云 CVM

```bash
# 类似阿里云，但注意安全组配置
# 开放 3081 端口
```

### AWS EC2

```bash
# 使用 Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 部署脚本更新

更新您的部署脚本以支持生产环境：

```bash
#!/bin/bash
# 在服务器上执行

DEPLOY_DIR="/root/deploy"
COMPOSE_FILE="docker-compose.prod.yml"  # 使用生产环境配置

cd "$DEPLOY_DIR"

# 停止服务
docker-compose -f "$COMPOSE_FILE" stop frontend

# 拉取最新镜像
docker-compose -f "$COMPOSE_FILE" pull frontend

# 启动服务
docker-compose -f "$COMPOSE_FILE" up -d frontend

# 验证部署
sleep 10
curl -f http://localhost:3081/ || echo "部署验证失败"
```

## 监控和维护

### 1. 日志管理

```bash
# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f frontend

# 查看最近日志
docker-compose -f docker-compose.prod.yml logs --tail=100 frontend
```

### 2. 资源监控

```bash
# 查看容器资源使用
docker stats vite-react-app

# 查看磁盘使用
docker system df
```

### 3. 备份和恢复

```bash
# 备份配置
cp docker-compose.prod.yml docker-compose.prod.yml.backup

# 恢复配置
cp docker-compose.prod.yml.backup docker-compose.prod.yml
```

## 故障排除

### 1. 容器无法启动

```bash
# 查看详细错误
docker-compose -f docker-compose.prod.yml logs frontend

# 检查端口占用
netstat -tlnp | grep 3081

# 检查镜像是否存在
docker images | grep jerryweblee/psylax-fe
```

### 2. 服务无法访问

```bash
# 检查容器状态
docker-compose -f docker-compose.prod.yml ps

# 检查网络连接
curl -v http://localhost:3081/

# 检查防火墙
sudo ufw status
```

### 3. 内存不足

```bash
# 查看内存使用
free -h

# 清理未使用的 Docker 资源
docker system prune -f
```

## 总结

对于云服务部署：

1. **单应用部署**：使用 `docker-compose.prod.yml`，不需要网络配置
2. **多服务部署**：使用 `docker-compose.yml`，需要网络配置
3. **安全第一**：添加安全配置和资源限制
4. **监控重要**：定期检查日志和资源使用
5. **备份必要**：定期备份配置文件和数据
