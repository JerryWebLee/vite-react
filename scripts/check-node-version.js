// scripts/check-node-version.js
const currentVersion = process.versions.node.split(".").map(Number);
const [major, minor, patch] = currentVersion;

// 检查是否 ≥ 20.8.1
const isVersionValid =
  major > 20 || (major === 20 && minor > 8) || (major === 20 && minor === 8 && patch >= 1);

if (!isVersionValid) {
  console.error("❌ Error: Node.js version must be >=20.8.1");
  console.error(`Current version: ${process.version}`);
  process.exit(1);
}

console.log("✅ Node.js version check passed");
