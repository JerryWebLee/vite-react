# Docker 部署指南

本项目提供了完整的Docker化部署方案，支持生产环境和开发环境。

## 📁 文件说明

- `Dockerfile` - 生产环境多阶段构建文件
- `Dockerfile.dev` - 开发环境构建文件
- `docker-compose.yml` - Docker Compose配置文件
- `nginx/docker.conf` - 优化的nginx配置
- `.dockerignore` - Docker构建忽略文件
- `deploy.sh` - 自动化部署脚本

## 🚀 快速开始

### 方法一：使用部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：使用Docker Compose

```bash
# 生产环境部署
docker-compose up -d

# 开发环境部署
docker-compose --profile dev up -d
```

### 方法三：手动构建

```bash
# 构建镜像
docker build -t vite-react-app:latest .

# 运行容器
docker run -d \
  --name vite-react-app \
  --restart unless-stopped \
  -p 3081:3081 \
  vite-react-app:latest
```

## 🔧 配置说明

### 端口配置

- 应用默认运行在 `3081` 端口
- 可通过修改 `docker-compose.yml` 或 `deploy.sh` 中的端口映射来更改

### 环境变量

- `NODE_ENV`: 环境模式（production/development）
- 可在 `docker-compose.yml` 中添加更多环境变量

### API代理配置

nginx配置中的API代理地址为 `http://192.188.4.97:53090`，请根据实际后端服务地址修改 `nginx/docker.conf` 文件中的 `proxy_pass` 配置。

## 📊 性能优化

### 多阶段构建

- 使用多阶段构建减少最终镜像大小
- 构建阶段使用Node.js，生产阶段使用nginx

### 缓存优化

- 静态资源设置长期缓存
- HTML文件不缓存，确保SPA路由正常工作

### 压缩优化

- 启用gzip压缩
- 支持多种文件类型压缩

## 🔒 安全配置

- 使用非root用户运行nginx
- 添加安全响应头
- 配置CORS和XSS保护

## 🐛 故障排除

### 查看容器日志

```bash
docker logs vite-react-app
```

### 进入容器调试

```bash
docker exec -it vite-react-app sh
```

### 检查容器状态

```bash
docker ps
docker stats vite-react-app
```

### 健康检查

容器内置健康检查，可通过以下命令查看：

```bash
docker inspect vite-react-app | grep Health -A 10
```

## 📝 注意事项

1. 确保服务器已安装Docker和Docker Compose
2. 确保3081端口未被占用
3. 生产环境部署前请修改API代理地址
4. 建议使用HTTPS在生产环境中部署

## 🔄 更新部署

```bash
# 停止并删除旧容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

或者直接使用部署脚本：

```bash
./deploy.sh
```
