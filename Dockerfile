# 多阶段构建 - 构建阶段
FROM node:20.20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 更新系统包并安装安全更新
RUN apk update && apk upgrade --no-cache

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm@latest

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段 - 使用nginx
FROM nginx:1.26-alpine AS production

# 更新系统包并安装安全更新，然后清理缓存
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# 创建非root用户和组
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# 复制构建产物到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx/docker.conf /etc/nginx/conf.d/default.conf

# 创建nginx缓存目录并设置权限
RUN mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/conf.d && \
    mkdir -p /run/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /run/nginx && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /etc/nginx/conf.d/default.conf

# 设置nginx配置文件权限
RUN chown nginx:nginx /etc/nginx/conf.d/default.conf

# 切换到nginx用户
USER nginx

# 暴露端口
EXPOSE 3081

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3081/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 