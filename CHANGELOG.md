# 版本更新记录

> 本文档由系统自动生成

# [1.3.0](https://github.com/JerryWebLee/vite-react/compare/v1.2.0...v1.3.0) (2025-08-24)

### ✨ 新增功能

- 将自动部署流程重构为基于Docker的完整CI/CD流水线，支持健康检查和回滚机制 ([f3bb759a](https://github.com/JerryWebLee/vite-react/commit/f3bb759a3c1c294912fec1cffd1a7d042e64805d))
- 添加 GitHub Actions 测试和诊断工具 ([08bad592](https://github.com/JerryWebLee/vite-react/commit/08bad5922614d6b6178ebdd37e2017e15f52b173))
- 添加自动部署配置和脚本 ([8db6930c](https://github.com/JerryWebLee/vite-react/commit/8db6930ccf02c03080b143e3bd7b23678ca7097e))

### 🔧 持续集成

- 添加 GitHub Actions 自动部署流程，包含测试构建、安全扫描和多环境部署 ([e072e2cb](https://github.com/JerryWebLee/vite-react/commit/e072e2cbfc4c7aa20e9be1d1552f73e063f5a1b2))
- 添加Docker部署配置及安全文档支持容器化部署 ([e7cd4d97](https://github.com/JerryWebLee/vite-react/commit/e7cd4d97b8f6fe553a32d86bc89a19abbf6d5875))
- 移除 GitHub Actions 部署流程及相关文档，迁移至云服务部署方案 ([1c4f8099](https://github.com/JerryWebLee/vite-react/commit/1c4f80991bb15312511686d2f2ab265900c8ca16))
- 移除生产环境 URL 配置并优化部署验证逻辑，改用远程验证脚本 ([e00658a0](https://github.com/JerryWebLee/vite-react/commit/e00658a0b43d014456d82542560f34eb68fb7827))

# [1.2.0](https://github.com/JerryWebLee/vite-react/compare/v1.1.0...v1.2.0) (2025-07-07)

### ✨ 新增功能

- 添加 react-moveable 和 react-selecto 依赖以支持元素拖拽和选择功能 ([14e3b8e2](https://github.com/JerryWebLee/vite-react/commit/14e3b8e2de5bf6c935dc09688ba08d6cc9935a95))

# [1.1.0](https://github.com/JerryWebLee/vite-react/compare/v1.0.0...v1.1.0) (2025-06-25)

### ✨ 新增功能

- 删除旧部署脚本并添加 Node 版本检查功能 ([c5cb93c7](https://github.com/JerryWebLee/vite-react/commit/c5cb93c7dc676f34c8ef01540cb66836521b5773))

### 📚 文档更新

- 更新 CHANGELOG 格式，将项目初始化配置和缺陷修复的列表项符号从星号改为短横线 ([9d830d9c](https://github.com/JerryWebLee/vite-react/commit/9d830d9c350eb52382acb7d11dd924a411ab8080))

### 🧪 测试相关

- 测试 commit ([5a0f1d24](https://github.com/JerryWebLee/vite-react/commit/5a0f1d240cc253ecb4de867c72379a073d29b4ae))

# 1.0.0 (2025-06-24)

### ✨ 新增功能

- 初始化项目配置：添加环境变量、Git钩子、代码规范及开发工具配置 ([46257d90](https://github.com/JerryWebLee/vite-react/commit/46257d909cb00cf91a3b8d649c213b156f07f8ec))

### 🐛 修复缺陷

- 添加 lodash-es 和 deadfile 插件，清理无用 SVG 文件并更新 gitignore ([2dd333ec](https://github.com/JerryWebLee/vite-react/commit/2dd333ecc561fbaa8ebd4d7066982812ace301e5))

# 版本更新记录
