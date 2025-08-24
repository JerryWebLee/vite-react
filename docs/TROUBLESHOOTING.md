# GitHub Actions 故障排除指南

## 公共仓库 Actions 问题排查

### 1. 检查账户状态

访问以下链接检查您的 GitHub 账户状态：

- **计费状态**：https://github.com/settings/billing
- **Actions 使用情况**：https://github.com/settings/billing/actions
- **账户设置**：https://github.com/settings/account

### 2. 检查仓库设置

确认仓库确实是公共的：

1. 进入您的仓库页面
2. 查看仓库名称旁边是否有 "Public" 标签
3. 如果没有，进入 Settings → General → Danger Zone → Change repository visibility

### 3. 检查 Actions 使用情况

在 GitHub 设置中查看：

- 本月已使用的 Actions 分钟数
- 剩余可用分钟数
- 是否有超出限制的警告

### 4. 常见问题及解决方案

#### 问题 A：账户验证问题

```
错误：recent account payments have failed
```

**解决方案**：

1. 检查账户邮箱是否已验证
2. 确认账户没有被限制
3. 联系 GitHub 支持

#### 问题 B：分钟数超限

```
错误：spending limit needs to be increased
```

**解决方案**：

1. 等待下个月重置（每月 1 号）
2. 升级到付费计划
3. 使用自托管 Runner

#### 问题 C：仓库权限问题

```
错误：repository access denied
```

**解决方案**：

1. 确认仓库确实是公共的
2. 检查账户权限
3. 重新设置仓库可见性

### 5. 立即解决方案

#### 方案一：等待重置

如果是分钟数超限，等待下个月 1 号自动重置。

#### 方案二：使用本地部署

```bash
# 在服务器上直接部署
./scripts/local-deploy.sh latest
```

#### 方案三：设置自托管 Runner

按照 `docs/SELF_HOSTED_RUNNER.md` 的步骤操作。

### 6. 验证步骤

#### 检查仓库可见性

```bash
# 在浏览器中访问
https://github.com/YOUR_USERNAME/YOUR_REPO
# 应该看到 "Public" 标签
```

#### 检查 Actions 状态

```bash
# 在浏览器中访问
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
# 应该能够创建和运行工作流
```

#### 测试简单工作流

创建一个简单的测试工作流：

```yaml
# .github/workflows/test.yml
name: Test Workflow

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test
        run: echo "Hello World"
```

### 7. 联系支持

如果以上步骤都无法解决问题：

1. **GitHub 支持**：https://support.github.com/
2. **社区论坛**：https://github.community/
3. **状态页面**：https://www.githubstatus.com/

### 8. 临时解决方案

在问题解决之前，可以使用本地部署：

```bash
# 1. 构建镜像
docker build -t jerryweblee/psylax-fe:latest .

# 2. 推送镜像
docker push jerryweblee/psylax-fe:latest

# 3. 在服务器上部署
./scripts/local-deploy.sh latest
```

### 9. 预防措施

1. **监控使用情况**：定期检查 Actions 使用量
2. **优化工作流**：减少不必要的步骤
3. **使用缓存**：利用 GitHub Actions 缓存功能
4. **设置限制**：在设置中配置使用限制

### 10. 调试命令

```bash
# 检查 Docker 状态
docker ps
docker-compose ps

# 查看日志
docker-compose logs frontend

# 验证部署
./scripts/deploy-verify.sh

# 检查网络
curl -I http://localhost:3081/
```
