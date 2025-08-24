# Docker 安全改进说明

## 已实施的安全措施

### 1. 基础镜像更新

- **Node.js**: 从 `node:20-alpine` 更新到 `node:20.20-alpine`
- **Nginx**: 从 `nginx:1.25-alpine` 更新到 `nginx:1.26-alpine`

### 2. 系统安全更新

- 在构建阶段和生产阶段都添加了 `apk update && apk upgrade --no-cache`
- 清理了包管理器缓存 `rm -rf /var/cache/apk/*`

### 3. 用户权限安全

- 创建了非root用户 `nginx` (UID: 1001)
- 所有文件和目录都设置了正确的所有权
- 应用以非root用户身份运行

### 4. 文件权限设置

- 静态文件权限: `755`
- 配置文件权限: `644`
- 禁止访问敏感文件

### 5. Nginx安全配置

- 隐藏nginx版本信息
- 添加了全面的安全头
- 内容安全策略 (CSP)
- 禁止访问隐藏文件和敏感文件
- 限制请求大小

### 6. 构建优化

- 添加了 `.dockerignore` 文件减少构建上下文
- 多阶段构建减少最终镜像大小
- 移除了不必要的包和文件

## 使用方法

### 构建安全镜像

```bash
# 构建并扫描镜像
npm run docker:build:secure

# 仅构建镜像
npm run docker:build

# 仅扫描镜像
npm run docker:scan
```

### 手动构建

```bash
# 构建镜像
docker build -t vite-react-app:latest .

# 使用Trivy扫描安全漏洞
trivy image --severity HIGH,CRITICAL vite-react-app:latest
```

## 安全头说明

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' http://192.188.4.97:53090;
frame-ancestors 'self';
```

### 其他安全头

- `X-Frame-Options: SAMEORIGIN` - 防止点击劫持
- `X-Content-Type-Options: nosniff` - 防止MIME类型嗅探
- `X-XSS-Protection: 1; mode=block` - XSS保护
- `Referrer-Policy: strict-origin-when-cross-origin` - 引用策略
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` - HSTS

## 定期维护

### 1. 更新基础镜像

定期检查并更新基础镜像到最新版本：

```bash
# 检查可用版本
docker pull node:20-alpine
docker pull nginx:alpine
```

### 2. 安全扫描

建议在CI/CD流程中集成安全扫描：

```bash
# 使用Trivy进行安全扫描
trivy image --severity HIGH,CRITICAL your-image:tag
```

### 3. 依赖更新

定期更新项目依赖：

```bash
pnpm update
pnpm audit fix
```

## 注意事项

1. **API代理配置**: 确保后端API地址 `192.188.4.97:53090` 是安全的
2. **HTTPS**: 生产环境建议使用HTTPS
3. **监控**: 建议配置日志监控和告警
4. **备份**: 定期备份重要数据

## 故障排除

如果遇到权限问题：

```bash
# 检查容器内用户
docker exec -it container-name whoami

# 检查文件权限
docker exec -it container-name ls -la /usr/share/nginx/html
```

如果遇到安全扫描失败：

```bash
# 查看详细漏洞信息
trivy image --severity HIGH,CRITICAL --format json your-image:tag
```
