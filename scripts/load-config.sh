#!/bin/bash

# 配置加载脚本
# 用于读取本地配置文件并设置环境变量

CONFIG_FILE="deploy.config"

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    echo "请创建配置文件或使用环境变量"
    return 1
fi

# 读取配置文件并设置环境变量
echo "📋 加载配置文件: $CONFIG_FILE"
while IFS='=' read -r key value; do
    # 跳过注释和空行
    if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
        continue
    fi
    
    # 去除前后空格
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # 跳过空值
    if [ -z "$key" ] || [ -z "$value" ]; then
        continue
    fi
    
    # 设置环境变量
    export "$key=$value"
    echo "  $key=$value"
done < "$CONFIG_FILE"

echo "✅ 配置加载完成" 