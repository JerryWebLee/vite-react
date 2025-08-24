# 自托管 GitHub Actions Runner 设置指南

## 概述

自托管 Runner 可以解决 GitHub Actions 分钟数限制问题，让您在私有仓库中免费使用 Actions。

## 设置步骤

### 1. 在 GitHub 仓库中设置 Runner

1. 进入您的 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单中点击 "Actions" → "Runners"
4. 点击 "New self-hosted runner"
5. 选择操作系统（Linux）
6. 复制提供的设置命令

### 2. 在服务器上安装 Runner

```bash
# 在您的服务器上执行以下命令

# 创建 runner 目录
mkdir actions-runner && cd actions-runner

# 下载 runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# 解压
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# 配置 runner（使用 GitHub 提供的命令）
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# 安装服务
sudo ./svc.sh install

# 启动服务
sudo ./svc.sh start
```

### 3. 更新工作流配置

修改 `.github/workflows/deploy.yml` 以使用自托管 Runner：

```yaml
name: Deploy Frontend to Server

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  DOCKER_IMAGE: jerryweblee/psylax-fe
  DOCKER_TAG: latest

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: self-hosted # 使用自托管 Runner
    outputs:
      image-tag: ${{ steps.build.outputs.image-tag }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Generate image tag
        id: build
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          SHORT_SHA=$(git rev-parse --short HEAD)
          IMAGE_TAG="${TIMESTAMP}-${SHORT_SHA}"
          echo "image-tag=${IMAGE_TAG}" >> $GITHUB_OUTPUT
          echo "Generated image tag: ${IMAGE_TAG}"

      - name: Build and push Docker image
        run: |
          chmod +x ./deploy.sh
          export IMAGE_TAG="${{ steps.build.outputs.image-tag }}"
          ./deploy.sh "$IMAGE_TAG"

  deploy-remote:
    name: Deploy to Remote Server
    runs-on: self-hosted # 使用自托管 Runner
    needs: build-and-push
    environment:
      name: production
    steps:
      - name: Deploy to Remote Server via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # ... 部署脚本内容 ...

  notify:
    name: Notify Deployment Status
    runs-on: self-hosted # 使用自托管 Runner
    needs: [build-and-push, deploy-remote]
    if: always()
    steps:
      - name: Notify success
        if: needs.deploy-remote.result == 'success'
        run: |
          echo "✅ 部署成功完成！"
          echo "镜像标签: ${{ needs.build-and-push.outputs.image-tag }}"
          echo "部署时间: $(date)"

      - name: Notify failure
        if: needs.deploy-remote.result == 'failure'
        run: |
          echo "❌ 部署失败！"
          echo "请检查 GitHub Actions 日志获取详细信息"
          exit 1
```

## 优势

1. **免费使用**：不受 GitHub Actions 分钟数限制
2. **更好的性能**：使用您自己的服务器资源
3. **更多控制**：可以自定义 Runner 环境
4. **安全性**：代码在您控制的服务器上运行

## 注意事项

1. **服务器要求**：

   - 至少 2GB RAM
   - 至少 10GB 可用磁盘空间
   - 稳定的网络连接

2. **维护责任**：

   - 需要定期更新 Runner
   - 需要监控服务器资源
   - 需要确保服务器安全

3. **成本考虑**：
   - 服务器运行成本
   - 维护时间成本

## 故障排除

### Runner 无法连接

```bash
# 检查 Runner 状态
sudo ./svc.sh status

# 重启 Runner
sudo ./svc.sh restart

# 查看日志
sudo journalctl -u actions.runner.* -f
```

### 权限问题

```bash
# 确保 Runner 用户有足够权限
sudo usermod -aG docker $USER
sudo usermod -aG docker actions-runner
```

### 网络问题

```bash
# 测试网络连接
curl -I https://github.com
ping github.com
```

## 推荐配置

对于小型项目，建议：

1. 使用 2GB RAM 的服务器
2. 定期备份 Runner 配置
3. 设置监控和告警
4. 定期更新 Runner 版本
