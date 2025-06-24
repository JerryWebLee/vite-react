#!/bin/bash

# 设置变量
LOCAL_BUILD_DIR="dist"  # 本地构建目录
REMOTE_USER="root"                 # 远程服务器用户
REMOTE_HOST="192.168.99.241"        # 远程服务器地址
REMOTE_DIR="/data/nginx/html/smartsecurity/devops"     # 远程服务器部署目录
DOCKER_CONTAINER_NAME="dev-nginx"  # Docker 容器名称

echo "👉 文件打包..."
pnpm build
echo "👉 打包完成"

# 备份旧文件
echo "👉 备份远程服务器上的旧文件..."
ssh ${REMOTE_USER}@${REMOTE_HOST} <<EOF
  if [ -d "${REMOTE_DIR}" ]; then
    TIMESTAMP=\$(date +"%Y%m%d%H%M%S")
    mv ${REMOTE_DIR}/dist ${REMOTE_DIR}/dist_\$TIMESTAMP || { echo "❌ 备份失败！"; exit 1; }
    echo "✅ 旧文件已备份到 ${REMOTE_DIR}/dist_\$TIMESTAMP"
  fi
EOF

# 复制新文件到远程服务器
echo "👉 复制新文件到远程服务器..."
scp -r ${LOCAL_BUILD_DIR}/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/dist/

echo "🔧 设置远程服务器上 dist 目录的权限..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod -R 755 ${REMOTE_DIR}/dist/"

# 连接远程服务器，重启 Docker 容器
echo "👉 远程连接并重启 Docker 容器..."
ssh ${REMOTE_USER}@${REMOTE_HOST} <<EOF
  docker restart ${DOCKER_CONTAINER_NAME} || { echo "❌ Docker 容器重启失败！"; exit 1; }
  echo "✅ Docker 容器已成功重启！"
EOF

echo "🎉 部署完成！"
