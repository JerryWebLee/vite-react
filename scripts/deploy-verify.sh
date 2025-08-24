#!/bin/bash
set -euo pipefail

# 部署验证脚本
SERVICE_NAME="frontend"
HEALTH_CHECK_URL="http://localhost:3081/"
MAX_RETRIES=10
RETRY_INTERVAL=10

echo "=== 开始部署验证 ==="
echo "验证时间: $(date)"
echo "服务名称: $SERVICE_NAME"
echo "健康检查 URL: $HEALTH_CHECK_URL"

# 检查容器是否运行
echo "检查容器状态..."
if ! docker compose ps $SERVICE_NAME | grep -q "Up"; then
    echo "❌ 容器未运行"
    echo "容器状态:"
    docker compose ps $SERVICE_NAME
    exit 1
fi

echo "✅ 容器正在运行"

# 健康检查
echo "执行健康检查..."
for i in $(seq 1 $MAX_RETRIES); do
    echo "尝试 $i/$MAX_RETRIES..."
    
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        break
    else
        if [ $i -eq $MAX_RETRIES ]; then
            echo "❌ 健康检查失败，已达到最大重试次数"
            echo "容器日志:"
            docker compose logs --tail=50 $SERVICE_NAME
            exit 1
        fi
        echo "健康检查失败，等待 $RETRY_INTERVAL 秒后重试..."
        sleep $RETRY_INTERVAL
    fi
done

# 检查资源使用情况
echo "检查资源使用情况..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep $SERVICE_NAME || echo "无法获取资源使用情况"

# 检查端口监听
echo "检查端口监听..."
if netstat -tlnp 2>/dev/null | grep -q ":3081 "; then
    echo "✅ 端口 3081 正在监听"
else
    echo "⚠️  无法确认端口 3081 监听状态"
fi

# 显示最终状态
echo "=== 部署验证完成 ==="
echo "服务状态:"
docker compose ps $SERVICE_NAME
echo "最新日志:"
docker compose logs --tail=10 $SERVICE_NAME
echo "✅ 部署验证成功！" 