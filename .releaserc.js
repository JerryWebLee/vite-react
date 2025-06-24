// .releaserc.js
export default {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# 版本更新记录\n\n> 本文档由系统自动生成",
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        writerOpts: {
          transform(commit, context) {
            const typeMap = {
              feat: "✨ 新增功能",
              fix: "🐛 修复缺陷",
              docs: "📚 文档更新",
              style: "🎨 代码格式",
              refactor: "🔨 代码重构",
              perf: "⚡ 性能提升",
              test: "🧪 测试相关",
              build: "🛠 构建相关",
              ci: "🔧 持续集成",
              revert: "⏪ 回退代码",
              chore: "🧹 其他修改",
            };

            // 返回一个新对象，避免修改原 commit
            return {
              // ...commit,
              type: typeMap[commit.type] || commit.type,
              shortHash: commit.shortHash || commit.hash?.substring(0, 8),
            };
          },
        },
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
