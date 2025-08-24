# 快速开始指南

## 🚀 5分钟快速部署

### 第一步：准备本地环境

确保您已经安装了 Docker Desktop 并已登录 Docker Hub：

```bash
# 检查 Docker 是否运行
docker info

# 登录 Docker Hub（如果还没有登录）
docker login
```

### 第二步：配置服务器信息

创建本地配置文件（不会被推送到 GitHub）：

```bash
# 复制配置模板
cp deploy.config.example deploy.config

# 编辑配置文件
vim deploy.config
```

配置文件内容示例：

```bash
# 服务器配置
SERVER_HOST=111.229.191.217
SERVER_USER=ubuntu

# Docker 配置
DOCKER_IMAGE=jerryweblee/psylax-fe
DOCKER_TAG=latest

# 部署配置
DEPLOY_PORT=3081
DEPLOY_DIR=/data/deploy
```

### 第三步：服务器初始化

在您的云服务器上运行：

```bash
# 1. 上传初始化脚本
scp scripts/server-setup.sh root@YOUR_SERVER_IP:/tmp/

# 2. 在服务器上运行初始化
ssh root@YOUR_SERVER_IP
cd /tmp
chmod +x server-setup.sh
./server-setup.sh
```

### 第四步：本地构建

在本地项目目录下运行：

```bash
# 推荐：使用简化版本构建脚本（最稳定）
./scripts/build-simple.sh
```

### 第五步：一键部署

使用便捷部署脚本：

```bash
# 使用配置文件自动部署
./scripts/deploy.sh

# 或使用自定义标签
./scripts/deploy.sh v1.0.0
```

### 第六步：验证部署

```bash
# 验证部署状态
./scripts/deploy-verify.sh

# 访问应用
curl http://localhost:3081/
```

## 📋 常用命令

### 构建相关

```bash
# 构建脚本（推荐使用简化版本）
./scripts/build-simple.sh

# 构建最新版本
./scripts/build-simple.sh

# 构建指定版本
./scripts/build-simple.sh v1.0.0

# 构建带时间戳的版本
./scripts/build-simple.sh $(date +%Y%m%d-%H%M%S)
```

### 部署相关

```bash
# 使用配置文件一键部署（推荐）
./scripts/deploy.sh

# 使用自定义标签部署
./scripts/deploy.sh v1.0.0

# 手动部署（需要设置环境变量）
./scripts/deploy-all.sh

# 验证部署
./scripts/deploy-verify.sh
```

### 监控相关

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f frontend

# 查看资源使用
docker stats
```

## 🔧 配置文件说明

### 配置文件位置

- **主配置文件**：`deploy.config`（不会被推送到 GitHub）
- **配置模板**：`deploy.config.example`（会被推送到 GitHub）

### 配置项说明

| 配置项         | 说明            | 示例                    |
| -------------- | --------------- | ----------------------- |
| `SERVER_HOST`  | 服务器 IP 地址  | `111.229.191.217`       |
| `SERVER_USER`  | SSH 用户名      | `ubuntu`                |
| `DOCKER_IMAGE` | Docker 镜像名称 | `jerryweblee/psylax-fe` |
| `DOCKER_TAG`   | Docker 镜像标签 | `latest`                |
| `DEPLOY_PORT`  | 部署端口        | `3081`                  |
| `DEPLOY_DIR`   | 服务器部署目录  | `/data/deploy`          |

### 创建配置文件

```bash
# 方法一：复制模板文件
cp deploy.config.example deploy.config
vim deploy.config

# 方法二：手动创建
cat > deploy.config << 'EOF'
SERVER_HOST=111.229.191.217
SERVER_USER=ubuntu
DOCKER_IMAGE=jerryweblee/psylax-fe
DOCKER_TAG=latest
DEPLOY_PORT=3081
DEPLOY_DIR=/data/deploy
EOF
```

## 🛠️ 故障排除

### 配置文件问题

如果遇到配置错误：

```bash
# 检查配置文件是否存在
ls -la deploy.config

# 检查配置内容
cat deploy.config

# 重新创建配置文件
cp deploy.config.example deploy.config
vim deploy.config
```

### 构建失败 - 脚本目录问题

如果遇到以下错误：

```
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ... "/scripts": not found
```

**解决方案**：

```bash
# 使用简化版本构建脚本（推荐）
./scripts/build-simple.sh
```

### 构建失败 - Node.js 版本检查问题

如果遇到以下错误：

```
Error: Cannot find module '/app/scripts/check-node-version.js'
```

**解决方案**：

```bash
# 使用简化版本构建脚本
./scripts/build-simple.sh

# 或使用修复版本构建脚本
./scripts/build-fix.sh
```

### 其他构建问题

```bash
# 检查 Docker 状态
docker info

# 检查 Dockerfile
cat Dockerfile

# 手动构建测试
docker build -t test .
```

### 部署失败

```bash
# 检查服务器连接
ssh ubuntu@111.229.191.217

# 检查 Docker 服务
systemctl status docker

# 查看部署日志
docker compose logs frontend
```

### 服务无法访问

```bash
# 检查端口
netstat -tlnp | grep 3081

# 检查防火墙
ufw status

# 测试连接
curl -I http://localhost:3081/
```

## 📞 获取帮助

如果遇到问题，可以：

1. **查看详细文档**：`LOCAL_DEPLOYMENT.md`
2. **运行诊断脚本**：`./scripts/diagnose-actions.sh`
3. **检查脚本帮助**：`./scripts/build-simple.sh --help`

## 🎯 下一步

部署成功后，您可以：

1. **配置域名**：将域名指向您的服务器 IP
2. **配置 HTTPS**：使用 Let's Encrypt 免费证书
3. **设置监控**：配置日志收集和监控告警
4. **优化性能**：根据实际使用情况调整资源配置

## 📝 注意事项

- 确保服务器防火墙开放了 3081 端口
- 定期备份 docker compose.yml 配置文件
- 监控服务器资源使用情况
- 定期更新 Docker 镜像和系统包
- **推荐使用 `build-simple.sh` 脚本，最稳定可靠**
- **`deploy.config` 文件不会被推送到 GitHub，请妥善保管**
