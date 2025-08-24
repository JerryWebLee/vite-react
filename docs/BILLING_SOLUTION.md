# GitHub Actions 计费问题解决方案

## 问题描述

GitHub Actions 报错：

```
The job was not started because recent account payments have failed or your spending limit needs to be increased.
```

## 原因分析

1. **私有仓库限制**：GitHub 免费账户对私有仓库的 Actions 分钟数为 0
2. **公共仓库限制**：免费账户每月只有 2,000 分钟
3. **计费问题**：账户可能存在付款问题

## 解决方案

### 方案一：升级 GitHub 计划（推荐）

#### GitHub Pro ($4/月)

- 私有仓库：3,000 分钟/月
- 公共仓库：2,000 分钟/月
- 高级功能：代码审查、分支保护等

#### GitHub Team ($4/用户/月)

- 私有仓库：3,000 分钟/月
- 团队协作功能
- 高级安全功能

### 方案二：将仓库设为公共仓库

如果代码可以公开：

1. 进入 GitHub 仓库设置
2. 滚动到底部 "Danger Zone"
3. 点击 "Change repository visibility"
4. 选择 "Make public"

**优势**：立即获得 2,000 分钟/月的免费 Actions 时间

### 方案三：使用自托管 Runner（推荐）

#### 设置步骤

1. **在 GitHub 仓库中设置 Runner**

   ```
   仓库 → Settings → Actions → Runners → New self-hosted runner
   ```

2. **在服务器上安装 Runner**

   ```bash
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

3. **更新工作流配置**
   ```yaml
   jobs:
     build-and-push:
       runs-on: self-hosted # 使用自托管 Runner
   ```

#### 优势

- ✅ 完全免费
- ✅ 不受分钟数限制
- ✅ 更好的性能
- ✅ 更多控制权

### 方案四：本地部署（最简单）

使用提供的本地部署脚本：

```bash
# 在服务器上直接运行
./scripts/local-deploy.sh [镜像标签]
```

#### 本地部署流程

1. **构建镜像**

   ```bash
   # 在本地或 CI 服务器上
   docker build -t jerryweblee/psylax-fe:latest .
   docker push jerryweblee/psylax-fe:latest
   ```

2. **在服务器上部署**

   ```bash
   cd /root/deploy
   ./scripts/local-deploy.sh latest
   ```

3. **验证部署**
   ```bash
   ./scripts/deploy-verify.sh
   ```

## 推荐方案

### 对于个人项目

1. **首选**：将仓库设为公共仓库
2. **备选**：使用本地部署脚本

### 对于企业项目

1. **首选**：升级到 GitHub Pro/Team
2. **备选**：使用自托管 Runner

### 对于敏感项目

1. **首选**：使用自托管 Runner
2. **备选**：升级到 GitHub Enterprise

## 成本对比

| 方案          | 成本       | 限制         | 维护复杂度 |
| ------------- | ---------- | ------------ | ---------- |
| 公共仓库      | 免费       | 2,000分钟/月 | 低         |
| GitHub Pro    | $4/月      | 3,000分钟/月 | 低         |
| 自托管 Runner | 服务器成本 | 无限制       | 中         |
| 本地部署      | 服务器成本 | 无限制       | 低         |

## 快速修复步骤

### 立即解决（5分钟）

1. **检查账户状态**

   ```
   https://github.com/settings/billing
   ```

2. **如果代码可以公开**

   ```
   仓库 → Settings → Danger Zone → Make public
   ```

3. **如果代码不能公开**
   ```
   使用本地部署脚本
   ./scripts/local-deploy.sh
   ```

### 长期解决（30分钟）

1. **设置自托管 Runner**

   ```
   按照 docs/SELF_HOSTED_RUNNER.md 操作
   ```

2. **更新工作流配置**
   ```
   将 runs-on: ubuntu-latest 改为 runs-on: self-hosted
   ```

## 故障排除

### 自托管 Runner 问题

```bash
# 检查状态
sudo ./svc.sh status

# 重启服务
sudo ./svc.sh restart

# 查看日志
sudo journalctl -u actions.runner.* -f
```

### 本地部署问题

```bash
# 检查 Docker 状态
docker ps
docker-compose ps

# 查看日志
docker-compose logs frontend

# 验证部署
./scripts/deploy-verify.sh
```

### 权限问题

```bash
# 确保用户有 Docker 权限
sudo usermod -aG docker $USER
newgrp docker
```

## 总结

1. **立即解决**：将仓库设为公共仓库或使用本地部署
2. **长期解决**：设置自托管 Runner 或升级 GitHub 计划
3. **最佳实践**：根据项目需求选择合适的方案

选择最适合您项目的方案，确保部署流程的稳定性和成本效益。
