# 部署指南

## 🚀 快速部署

### 首次设置（一次性）

1. **创建配置文件**

```bash
cp deploy.config.example deploy.config
vim deploy.config
```

2. **服务器修复和初始化**

```bash
# 自动修复服务器问题（推荐）
./scripts/fix-server.sh

# 或手动初始化
scp scripts/server-setup.sh ubuntu@111.229.191.217:/tmp/
ssh ubuntu@111.229.191.217 "cd /tmp && chmod +x server-setup.sh && sudo ./server-setup.sh"
```

### 日常部署

**推荐方式：**

```bash
./scripts/deploy.sh
```

**备选方式：**

```bash
./scripts/deploy-all.sh
```

## 📋 脚本说明

| 脚本                      | 功能             | 使用场景                   |
| ------------------------- | ---------------- | -------------------------- |
| `deploy.sh`               | **便捷部署**     | **日常使用（推荐）**       |
| `deploy-all.sh`           | 一键部署         | 完整流程                   |
| `build-platform.sh`       | **平台兼容构建** | **推荐（解决平台兼容性）** |
| `build-multi-platform.sh` | 多平台构建       | 高级多平台构建             |
| `build-simple.sh`         | 单平台构建       | 仅构建镜像                 |
| `fix-server.sh`           | **服务器修复**   | **解决权限问题**           |
| `server-setup.sh`         | 服务器初始化     | 首次设置                   |
| `check-config.sh`         | 配置检查         | 验证配置是否正确           |

## 🔧 配置文件

确保 `deploy.config` 文件包含：

```bash
SERVER_HOST=111.229.191.217
SERVER_USER=ubuntu
DOCKER_IMAGE=jerryweblee/psylax-fe
DOCKER_TAG=latest
DEPLOY_PORT=3081
DEPLOY_DIR=/data/deploy
```

## 🛠️ 故障排除

### 配置检查

```bash
# 检查配置是否正确
./scripts/check-config.sh
```

### 权限问题

```bash
chmod +x scripts/*.sh
```

### 服务器权限问题

```bash
# 自动修复服务器问题
./scripts/fix-server.sh
```

### 配置文件问题

```bash
cp deploy.config.example deploy.config
vim deploy.config
```

### 构建问题

```bash
./scripts/build-simple.sh
```

## 📞 获取帮助

- 查看详细文档：`LOCAL_DEPLOYMENT.md`
- 查看快速开始：`QUICK_START.md`
