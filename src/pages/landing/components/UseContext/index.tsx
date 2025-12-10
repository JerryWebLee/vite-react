// App.js
import { useState } from "react";
import { ThemeContext } from "./ThemeContext";
import ThemedButton from "./ThemedButton";

export default function UseContext() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    // 凡是被包裹在 Provider 内部的组件，都可以访问到 value
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>切换主题</button>
        <ThemedButton />
      </div>
    </ThemeContext.Provider>
  );
}
