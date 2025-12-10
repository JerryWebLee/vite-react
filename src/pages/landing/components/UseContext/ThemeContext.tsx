// ThemeContext.js
import React from "react";

// 创建 Context，可以传入默认值（当组件上方没有匹配的 Provider 时生效）
export const ThemeContext = React.createContext<{
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}>({
  theme: "light",
  setTheme: () => null,
});
