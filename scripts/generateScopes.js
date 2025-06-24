import fs from "fs/promises";
import ignore from "ignore";
import path from "path";

let gitignoreRules = null;

async function loadGitignoreRules() {
  const ig = ignore();
  // 强制添加 .git 忽略规则（即使 .gitignore 中没有）
  ig.add(".git/\n.git");
  try {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    const content = await fs.readFile(gitignorePath, "utf-8");
    gitignoreRules = ig.add(content);
  } catch {
    gitignoreRules = ig;
  }
}

function shouldInclude(filePath, isDirectory) {
  // 排除隐藏文件/目录（除了特定配置文件）
  if (filePath.startsWith(".") && ![".env", ".npmrc", ".prettierrc"].includes(filePath)) {
    return false;
  }

  // 应用 gitignore 规则
  const relativePath = path.relative(process.cwd(), filePath);
  return !gitignoreRules?.ignores(relativePath + (isDirectory ? "/" : ""));
}

async function collectDirectoryItems(dir, prefix = "") {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    const results = [];

    for (const dirent of items) {
      const fullPath = path.join(dir, dirent.name);
      const displayName = prefix + dirent.name + (dirent.isDirectory() ? "/" : "");

      if (shouldInclude(fullPath, dirent.isDirectory())) {
        results.push(displayName);

        // 如果需要递归子目录（这里只处理一级）
        // if (dirent.isDirectory() && depth > 1) {
        //   const subItems = await collectDirectoryItems(fullPath, `${displayName}`, depth - 1);
        //   results.push(...subItems);
        // }
      }
    }

    return results;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

async function getScopes() {
  await loadGitignoreRules();

  const [srcItems, rootItems] = await Promise.all([
    collectDirectoryItems(path.join(process.cwd(), "src"), "src/"),
    collectDirectoryItems(process.cwd()),
  ]);

  // 合并并去重
  const allScopes = [...new Set([...srcItems, ...rootItems])].sort().filter(
    (scope) =>
      // 排除常见非代码目录
      !["node_modules/", "dist/", "build/"].includes(scope),
  );

  // 写入缓存文件
  const configPath = path.join(process.cwd(), ".cz-scopes.json");
  await fs.writeFile(configPath, JSON.stringify({ scopes: allScopes }, null, 2));

  return allScopes;
}

// 使用示例;
getScopes()
  .then((scopes) => console.log("----Generated Scopes Success----"))
  .catch(console.error);
