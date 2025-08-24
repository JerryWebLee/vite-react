# 部署配置优化说明

## 概述

本次优化对 GitHub Actions 部署流程进行了全面改进，提升了部署的可靠性、可维护性和监控能力。

## 主要优化内容

### 1. GitHub Actions 工作流优化

#### 新增功能：

- **手动触发部署**：添加了 `workflow_dispatch` 触发器，支持手动触发部署
- **版本标签管理**：自动生成带时间戳和 Git SHA 的镜像标签
- **环境配置**：添加了 production 环境配置
- **部署验证**：添加了部署后的验证步骤
- **通知机制**：添加了部署状态通知

#### 改进的错误处理：

- 使用 `set -euo pipefail` 启用严格错误处理
- 添加了详细的错误日志和状态检查
- 实现了自动回滚机制

### 2. 部署脚本优化

#### `deploy.sh` 改进：

- 支持传递自定义镜像标签
- 同时维护 `latest` 标签
- 添加了详细的构建日志
- 改进了错误处理和状态验证

#### 新增脚本：

- `scripts/verify-deployment.sh`：部署验证脚本
- `scripts/rollback.sh`：快速回滚脚本
- `scripts/deploy-verify.sh`：远程部署验证脚本

### 3. Docker Compose 配置优化

#### 资源管理：

- 添加了内存和 CPU 限制
- 配置了日志轮转
- 改进了健康检查配置

#### 网络配置：

- 配置了固定的子网
- 添加了 Traefik 标签支持

## 使用方法

### 自动部署

推送代码到 `main` 分支会自动触发部署流程。

### 手动部署

1. 在 GitHub 仓库页面，进入 "Actions" 标签
2. 选择 "Deploy Frontend to Server" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支并点击 "Run workflow"

### 部署验证

部署完成后，系统会自动执行以下验证：

- 容器状态检查
- 健康检查（HTTP 200 响应）
- 端口监听验证
- 资源使用情况检查

### 回滚操作

如果部署失败，可以手动执行回滚：

```bash
# 在服务器上执行
cd /root/deploy
./scripts/rollback.sh
```

### 手动验证部署

在服务器上执行验证：

```bash
# 在服务器上执行
cd /root/deploy
./scripts/deploy-verify.sh
```

## 配置要求

### GitHub Secrets

确保以下 secrets 已配置：

- `DOCKER_USERNAME`：Docker Hub 用户名
- `DOCKER_PASSWORD`：Docker Hub 密码
- `REMOTE_HOST`：远程服务器 IP 或域名
- `REMOTE_USER`：SSH 用户名
- `SSH_PRIVATE_KEY`：SSH 私钥

### 服务器要求

- Docker 和 Docker Compose 已安装
- 部署目录：`/root/deploy`
- 端口 3081 可用
- curl 命令可用（用于健康检查）

## 监控和日志

### 部署日志

- GitHub Actions 提供详细的构建和部署日志
- 服务器上的 Docker 日志：`docker-compose logs frontend`

### 健康检查

- 自动健康检查：每 30 秒检查一次
- 手动健康检查：`./scripts/deploy-verify.sh`

### 资源监控

- 内存限制：512MB
- CPU 限制：0.5 核心
- 日志轮转：最大 10MB，保留 3 个文件

## 故障排除

### 常见问题

1. **部署失败**

   - 检查 GitHub Secrets 配置
   - 查看 GitHub Actions 日志
   - 验证服务器连接和权限

2. **健康检查失败**

   - 检查容器是否正常运行
   - 查看容器日志
   - 验证端口是否正确监听

3. **回滚失败**

   - 确认备份文件存在
   - 检查网络连接
   - 验证镜像是否可访问

4. **Workflow 语法错误**
   - 确保 YAML 语法正确
   - 检查 secrets 使用位置
   - 验证环境配置

### 调试命令

```bash
# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs frontend

# 进入容器调试
docker-compose exec frontend sh

# 检查网络连接
curl -v http://localhost:3081/

# 查看资源使用
docker stats

# 验证部署
./scripts/deploy-verify.sh

# 执行回滚
./scripts/rollback.sh
```

## 版本管理

每次部署都会生成唯一的镜像标签，格式为：`YYYYMMDD-HHMMSS-SHORT_SHA`

例如：`20241201-143022-a1b2c3d`

这样可以：

- 追踪每次部署的版本
- 快速回滚到特定版本
- 保持部署历史记录

## 安全考虑

- 使用 SSH 密钥认证
- 限制容器资源使用
- 定期清理未使用的镜像
- 日志文件大小限制
- 健康检查防止服务异常

## 脚本说明

### deploy.sh

- 构建和推送 Docker 镜像
- 支持自定义标签
- 错误处理和日志记录

### scripts/verify-deployment.sh

- 本地部署验证
- 容器状态检查
- 健康检查

### scripts/rollback.sh

- 快速回滚到备份版本
- 自动恢复配置
- 验证回滚结果

### scripts/deploy-verify.sh

- 远程服务器部署验证
- 完整的健康检查
- 资源使用监控
