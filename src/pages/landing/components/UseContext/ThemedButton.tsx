// ThemedButton.js
import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function ThemedButton() {
  // 核心：传入 Context 对象，返回当前的 value
  const contextValue = useContext(ThemeContext);

  // 解构出我们需要的数据
  const { theme } = contextValue;

  return (
    <button
      style={{ background: theme === "dark" ? "#333" : "#FFF", color: theme === "dark" ? "#FFF" : "#000" }}
    >
      我是 {theme} 风格的按钮
    </button>
  );
}
