# 本地构建 + 云服务器部署指南

## 概述

本方案采用本地构建 Docker 镜像，然后推送到镜像仓库，最后在云服务器上部署的方式，避免了 GitHub Actions 的计费问题。

## 架构说明

```
本地开发环境 → 构建镜像 → 推送到 Docker Hub → 云服务器拉取镜像 → 部署运行
```

## 准备工作

### 1. 本地环境要求

- Docker Desktop 已安装并运行
- 已登录 Docker Hub：`docker login`
- Git 已配置

### 2. 云服务器要求

- Ubuntu/CentOS 系统
- 至少 1GB 内存
- 至少 10GB 磁盘空间
- 开放 3081 端口

## 部署流程

### 第一步：服务器初始化

在云服务器上运行初始化脚本：

```bash
# 1. 上传初始化脚本到服务器
scp scripts/server-setup.sh root@YOUR_SERVER_IP:/tmp/

# 2. 在服务器上运行初始化
ssh root@YOUR_SERVER_IP
cd /tmp
chmod +x server-setup.sh
./server-setup.sh
```

初始化脚本会自动：

- 安装 Docker 和 Docker Compose
- 创建部署目录 `/data/deploy`
- 配置防火墙规则
- 创建必要的部署脚本

### 第二步：本地构建

在本地项目目录下运行：

```bash
# 构建并推送镜像
./scripts/build.sh

# 或使用自定义标签
./scripts/build.sh v1.0.0
```

构建脚本会：

- 构建 Docker 镜像
- 推送到 Docker Hub
- 同时维护 `latest` 标签

### 第三步：服务器部署

在云服务器上运行：

```bash
# 进入部署目录
cd /data/deploy

# 部署最新版本
./scripts/server-deploy.sh

# 或部署指定版本
./scripts/server-deploy.sh v1.0.0
```

部署脚本会：

- 拉取最新镜像
- 停止旧服务
- 启动新服务
- 执行健康检查
- 清理旧镜像

### 第四步：验证部署

```bash
# 验证部署状态
./scripts/deploy-verify.sh

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs frontend
```

## 一键部署

### 方法一：手动部署

```bash
# 1. 本地构建
./scripts/build.sh

# 2. 服务器部署
ssh root@YOUR_SERVER_IP "cd /data/deploy && ./scripts/server-deploy.sh"
```

### 方法二：自动部署

设置环境变量后使用一键部署脚本：

```bash
# 设置服务器信息
export SERVER_HOST=YOUR_SERVER_IP
export SERVER_USER=root

# 一键部署
./scripts/deploy-all.sh
```

## 脚本说明

### 本地脚本

| 脚本                          | 功能           | 使用场景       |
| ----------------------------- | -------------- | -------------- |
| `scripts/build.sh`            | 本地构建镜像   | 每次代码更新后 |
| `scripts/deploy-all.sh`       | 一键构建和部署 | 完整部署流程   |
| `scripts/diagnose-actions.sh` | 环境诊断       | 排查问题       |

### 服务器脚本

| 脚本                       | 功能         | 使用场景     |
| -------------------------- | ------------ | ------------ |
| `scripts/server-setup.sh`  | 服务器初始化 | 首次部署     |
| `scripts/server-deploy.sh` | 服务器部署   | 每次部署     |
| `scripts/deploy-verify.sh` | 部署验证     | 验证部署结果 |

## 版本管理

### 标签策略

```bash
# 使用时间戳标签
./scripts/build.sh $(date +%Y%m%d-%H%M%S)

# 使用语义化版本
./scripts/build.sh v1.2.3

# 使用 Git 提交哈希
./scripts/build.sh $(git rev-parse --short HEAD)
```

### 回滚操作

```bash
# 回滚到指定版本
./scripts/server-deploy.sh v1.0.0

# 回滚到最新版本
./scripts/server-deploy.sh latest
```

## 监控和维护

### 查看服务状态

```bash
# 查看容器状态
docker compose ps

# 查看资源使用
docker stats

# 查看日志
docker compose logs -f frontend
```

### 清理资源

```bash
# 清理未使用的镜像
docker image prune -f

# 清理未使用的容器
docker container prune -f

# 清理未使用的网络
docker network prune -f
```

### 备份和恢复

```bash
# 备份配置
cp docker compose.yml docker compose.yml.backup

# 恢复配置
cp docker compose.yml.backup docker compose.yml
```

## 故障排除

### 常见问题

#### 1. 构建失败

```bash
# 检查 Docker 是否运行
docker info

# 检查 Dockerfile 语法
docker build --no-cache .

# 查看详细错误
docker build . 2>&1 | tee build.log
```

#### 2. 推送失败

```bash
# 检查登录状态
docker login

# 检查镜像是否存在
docker images | grep jerryweblee/psylax-fe
```

#### 3. 部署失败

```bash
# 检查网络连接
curl -I http://localhost:3081/

# 查看容器日志
docker compose logs frontend

# 检查端口占用
netstat -tlnp | grep 3081
```

#### 4. 服务无法访问

```bash
# 检查防火墙
ufw status

# 检查服务状态
systemctl status docker

# 重启服务
docker compose restart frontend
```

### 调试命令

```bash
# 进入容器调试
docker compose exec frontend sh

# 查看系统资源
htop
df -h
free -h

# 查看网络连接
netstat -tlnp
ss -tlnp
```

## 安全考虑

### 1. 镜像安全

- 使用官方基础镜像
- 定期更新基础镜像
- 扫描镜像漏洞

### 2. 容器安全

- 使用非 root 用户运行
- 限制容器权限
- 启用只读文件系统

### 3. 网络安全

- 配置防火墙规则
- 使用 HTTPS（如需要）
- 限制端口访问

## 性能优化

### 1. 镜像优化

- 使用多阶段构建
- 减少镜像层数
- 清理不必要的文件

### 2. 容器优化

- 设置资源限制
- 配置日志轮转
- 使用健康检查

### 3. 系统优化

- 定期清理 Docker 资源
- 监控系统资源使用
- 配置自动重启

## 总结

本地构建 + 云服务器部署方案的优势：

✅ **成本低**：无需 GitHub Actions 分钟数  
✅ **控制强**：完全控制构建和部署过程  
✅ **速度快**：本地构建，直接推送  
✅ **可靠性高**：不依赖第三方服务  
✅ **灵活性好**：可以自定义构建和部署流程

这个方案适合大多数中小型项目，既经济又高效。
