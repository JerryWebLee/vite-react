#!/bin/bash

# 重置 package.json
npm version 0.0.0 --no-git-tag-version

# 删除 Git 标签
git tag -d $(git tag -l)
git push origin --delete $(git tag -l) 2>/dev/null || true

# 删除 node_modules 中的缓存
rm -rf node_modules/.cache/semantic-release

# 清除可能存在的临时文件
rm -rf .git/semantic-release-*

# 清理日志文件
echo "# 版本更新记录" > CHANGELOG.md

# 提交变更
git add package.json CHANGELOG.md
git commit -m "chore: reset project version"
echo "Version reset to 0.0.0"