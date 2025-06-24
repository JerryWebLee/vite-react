import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { compression } from "vite-plugin-compression2";
import deadFile from "vite-plugin-deadfile";
import stylelint from "vite-plugin-stylelint";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";
import Icons from "unplugin-icons/vite";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      VITE_APP_BASE_NAME: JSON.stringify(env.VITE_APP_BASE_NAME),
      VITE_APP_BASE_URL: JSON.stringify(env.VITE_APP_BASE_URL),
      VITE_APP_TITLE_SUFFIX: JSON.stringify(env.VITE_APP_TITLE_SUFFIX),
    },
    server: {
      port: 3081,
      proxy: {
        [env.VITE_APP_BASE_URL]: {
          target: env.VITE_APP_BASE_URL_TARGET,
          changeOrigin: true,
          ws: true,
        },
      },
    },
    plugins: [
      deadFile({
        // 要扫描的目录，默认为项目根目录
        root: "src",
        // 要排除的文件/目录，基于 root 目录
        exclude: ["**/*.d.ts", "**/__tests__/**", "**/*.css", "**/*.less"],
        // 要包含的文件/目录，基于 root 目录
        include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.vue", "**/*.svg", "**/*.json"],
        // 输出文件
        output: ".deadfiles",
        // 输出文件夹
        outputDir: ".",
      }),
      stylelint({
        fix: true,
        include: ["src/**/*.{css,less}"],
      }),
      react(),
      svgr({
        svgrOptions: {
          // icon: true,
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
          svgoConfig: {
            floatPrecision: 2,
          },
          // 更新svg元素的宽高为1em，并将 fill 属性设置为 currentColor
          template: ({ imports, interfaces, componentName, props, jsx, exports }, { tpl }) => {
            // 1. 添加 SVG 根元素的属性
            const svgAttributes = [
              {
                type: "JSXAttribute",
                name: { type: "JSXIdentifier", name: "width" },
                value: { type: "StringLiteral", value: "1em" },
              },
              {
                type: "JSXAttribute",
                name: { type: "JSXIdentifier", name: "height" },
                value: { type: "StringLiteral", value: "1em" },
              },
              {
                type: "JSXAttribute",
                name: { type: "JSXIdentifier", name: "fill" },
                value: { type: "StringLiteral", value: "currentColor" },
              },
            ];

            // 2. 递归处理所有子元素的 fill 属性
            const processChildren = (node: any) => {
              if (node.type === "JSXElement") {
                // 处理当前元素的属性
                const fillAttributeIndex = node.openingElement.attributes.findIndex(
                  (attr: any) => attr.type === "JSXAttribute" && attr.name.name === "fill",
                );

                if (fillAttributeIndex >= 0) {
                  // 修改现有 fill 属性
                  node.openingElement.attributes[fillAttributeIndex].value = {
                    type: "StringLiteral",
                    value: "currentColor",
                  };
                } else {
                  // 添加新的 fill 属性
                  node.openingElement.attributes.push({
                    type: "JSXAttribute",
                    name: { type: "JSXIdentifier", name: "fill" },
                    value: { type: "StringLiteral", value: "currentColor" },
                  });
                }

                // 递归处理子元素
                if (node.children) {
                  node.children.forEach((child: any) => processChildren(child));
                }
              }
            };

            // 添加根元素属性
            jsx.openingElement.attributes.push(...svgAttributes);

            // 处理所有子元素
            jsx.children.forEach((child: any) => processChildren(child));

            const wrappedJsx = {
              type: "JSXElement",
              openingElement: {
                type: "JSXOpeningElement",
                name: { type: "JSXIdentifier", name: "span" },
                attributes: [
                  // // 添加 className 属性
                  // {
                  //   type: "JSXAttribute",
                  //   name: { type: "JSXIdentifier", name: "className" },
                  //   value: { type: "StringLiteral", value: "action" }, // 默认类名
                  // },
                ],
                selfClosing: false,
              },
              closingElement: {
                type: "JSXClosingElement",
                name: { type: "JSXIdentifier", name: "span" },
              },
              children: [jsx],
            };
            return tpl`
                        ${imports}
                        ${interfaces}
                        function ${componentName}(${props}) {
                          return ${wrappedJsx};
                        }
                        ${exports}
                      `;
          },
        },
      }),
      Icons({
        compiler: "jsx", // 或 'jsx' (React)
        autoInstall: true, // 自动安装图标集
        scale: 1,
        jsx: "react",
      }),
      { ...compression(), apply: "build" },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      // 默认 esbuild minify，而 esbuild 不仅会做压缩，
      // 而且还会在 target 配置允许的范围内做一些语法转换（例如把低版本语法转为高版本），
      // 尽可能减小 bundle 体积。最关键的是，esbuild 的 target 默认 esnext，
      // 这种情况下，即使你用 Babel、PostCSS 等工具做语法转换，也很难保证 esbuild 不会给你转换成高版本语法
      // （因为代码压缩总是最后一步）。
      // 由于 esbuild 最低只支持 es2015，如果需要支持更低版本浏览器，则可以改用 terser 压缩
      // minify: "terser",
      target: "es2015",
      cssTarget: "chrome61",
      rollupOptions: {
        output: {
          compact: true, // 开启紧凑模式，省略所有不必要的空格和注释
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/[name]-[hash].[ext]",
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom", "zustand", "react-helmet-async"],
            antd: [
              "antd",
              "@ant-design/icons",
              "@ant-design/cssinjs",
              "@ant-design/v5-patch-for-react-19",
              "dayjs",
              "rc-virtual-list",
            ],
            axios: ["axios"],
          },
        },
      },
    },
  };
});
