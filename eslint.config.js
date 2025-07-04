import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintPluginPrettierRecommended],
  files: ["**/*.{ts,tsx}"],
  ignores: ["dist", "node_modules", ".vscode", ".husky"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "no-multiple-empty-lines": ["error", { max: 1 }], // 禁止多个空行
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "simple-import-sort/exports": "error",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          [
            "^(node:|vite)",
            "^react",
            "^@?\\w",
            "^@/(components|assets)",
            "^\\.\\.(?!/?$)",
            "^\\.\\./?$",
            "^\\./(?=.*/)(?!/?$)",
            "^\\.(?!/?$)",
            "^\\./?$",
            "^@/(utils|store|hooks|api|router|constants|theme)",
          ],
          ["antd/locale/zh_CN", "dayjs/locale/zh-cn"],
          ["^.+\\.s?css$"],
        ],
      },
    ],
    "prettier/prettier": ["error", { endOfLine: "auto" }],
  },
});
