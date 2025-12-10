import React, { useCallback, useState } from "react";
import { Button, Input } from "antd";

export default function Demo1() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // 2. 使用 useCallback 缓存函数
  // 依赖项为空数组 []，说明该函数永远不会变
  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // 注意：这里使用了函数式更新，所以不需要依赖 count

  // 3. 普通函数（没有缓存）
  // 每次 ParentComponent 输入文字导致重渲染时，log 都会变
  const log = () => {
    console.log("Text changed");
  };

  return (
    <div>
      <h3>Count: {count}</h3>
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="输入文字触发父组件重渲染" />

      {/* 这里的 increment 引用没变，所以这个 Button 不会重新渲染 */}
      <Button onClick={increment}>点我 +1 (优化过)</Button>

      {/* 这里的 log 每次都变，导致这个 Button 每次都重新渲染，尽管它跟 text 无关 */}
      <Button onClick={log}>普通按钮 (未优化)</Button>
    </div>
  );
}
