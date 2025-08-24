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
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx/docker.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3081


# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 