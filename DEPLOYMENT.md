# 自动部署配置指南

本文档将指导您如何设置自动部署系统，实现代码提交后自动部署到云服务器。

## 方案概述

我们提供了两种自动部署方案：

1. **GitHub Actions** - 推荐方案，当代码推送到 main 分支时自动触发部署
2. **Webhook 部署** - 通过 Webhook 触发部署（可选）

## 方案1：GitHub Actions 自动部署

### 1. 服务器环境准备

在您的云服务器上运行以下命令：

```bash
# 下载服务器初始化脚本
wget https://raw.githubusercontent.com/JerryWebLee/vite-react/main/scripts/server-setup.sh
chmod +x server-setup.sh

# 运行初始化脚本（需要 root 权限）
sudo ./server-setup.sh
```

### 2. 生成 SSH 密钥对

在您的本地机器上生成 SSH 密钥：

```bash
# 生成 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 将公钥复制到服务器
ssh-copy-id deploy@your-server-ip
```

### 3. 配置 GitHub Secrets

在您的 GitHub 仓库中，进入 `Settings` > `Secrets and variables` > `Actions`，添加以下 secrets：

- `SERVER_HOST`: 您的服务器 IP 地址
- `SERVER_USERNAME`: `deploy`
- `SERVER_SSH_KEY`: 您的 SSH 私钥内容（整个文件内容）
- `SERVER_PORT`: `22`

### 4. 测试部署

推送代码到 main 分支：

```bash
git add .
git commit -m "feat: 添加自动部署配置"
git push origin main
```

GitHub Actions 将自动触发部署流程。

## 方案2：Webhook 部署（可选）

如果您希望使用 Webhook 触发部署，可以配置以下内容：

### 1. 创建 Webhook 接收器

```bash
# 在服务器上创建 webhook 接收器
sudo mkdir -p /opt/webhook
sudo chown deploy:deploy /opt/webhook
```

### 2. 配置 Webhook 脚本

创建 `/opt/webhook/webhook.js`：

```javascript
const http = require("http");
const { exec } = require("child_process");

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/deploy") {
    exec("/opt/vite-react/scripts/deploy.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`部署错误: ${error}`);
        res.writeHead(500);
        res.end("部署失败");
        return;
      }
      console.log(`部署成功: ${stdout}`);
      res.writeHead(200);
      res.end("部署成功");
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(9000, () => {
  console.log("Webhook 服务器运行在端口 9000");
});
```

### 3. 启动 Webhook 服务

```bash
# 安装 PM2
npm install -g pm2

# 启动 webhook 服务
pm2 start /opt/webhook/webhook.js --name webhook
pm2 save
pm2 startup
```

## 部署流程说明

### 自动部署流程

1. **代码推送** → 触发 GitHub Actions
2. **构建阶段** → 安装依赖、代码检查、构建应用
3. **部署阶段** → SSH 连接到服务器执行部署脚本
4. **部署脚本执行**：
   - 备份当前版本
   - 拉取最新代码
   - 安装依赖
   - 构建应用
   - 停止旧容器
   - 构建新 Docker 镜像
   - 启动新容器
   - 健康检查
   - 清理旧镜像和备份

### 回滚机制

如果部署失败，系统会自动回滚到上一个版本：

1. 停止新容器
2. 恢复备份
3. 启动旧版本
4. 发送失败通知

## 监控和维护

### 查看部署状态

```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs vite-react-app

# 查看部署日志
tail -f /opt/vite-react/deploy.log
```

### 手动部署

```bash
# 进入项目目录
cd /opt/vite-react

# 执行部署脚本
./scripts/deploy.sh production
```

### 清理资源

```bash
# 清理 Docker 镜像
docker image prune -f

# 清理备份（保留最近5个）
cd /opt/backups/vite-react
ls -t | tail -n +6 | xargs -r rm -rf
```

## 故障排除

### 常见问题

1. **SSH 连接失败**

   - 检查服务器防火墙设置
   - 确认 SSH 密钥配置正确
   - 验证 GitHub Secrets 设置

2. **构建失败**

   - 检查 Node.js 版本（需要 20.x）
   - 确认 pnpm 已安装
   - 查看构建日志

3. **容器启动失败**

   - 检查端口是否被占用
   - 查看容器日志
   - 确认 Docker 服务运行正常

4. **健康检查失败**
   - 检查应用是否正常启动
   - 确认端口配置正确
   - 查看应用日志

### 日志查看

```bash
# GitHub Actions 日志
# 在 GitHub 仓库的 Actions 页面查看

# 服务器部署日志
tail -f /opt/vite-react/deploy.log

# Docker 容器日志
docker logs -f vite-react-app

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 安全考虑

1. **SSH 密钥安全**

   - 使用强密码保护 SSH 密钥
   - 定期轮换 SSH 密钥
   - 限制 SSH 访问 IP

2. **服务器安全**

   - 定期更新系统
   - 配置防火墙规则
   - 使用 HTTPS 访问

3. **应用安全**
   - 定期更新依赖包
   - 扫描安全漏洞
   - 配置环境变量

## 性能优化

1. **构建优化**

   - 使用 Docker 多阶段构建
   - 配置构建缓存
   - 优化依赖安装

2. **部署优化**
   - 使用增量部署
   - 配置负载均衡
   - 优化资源使用

## 联系支持

如果您在设置过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 GitHub Actions 日志
3. 查看服务器部署日志
4. 提交 Issue 到项目仓库
