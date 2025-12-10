import { memo, useDeferredValue, useState } from "react";

// 假设这是一个渲染非常耗时的组件
const SlowList = memo(({ text }: { text: string }) => {
  console.log("SlowList rendering...");
  const items = [];
  for (let i = 0; i < 5000; i++) {
    items.push(
      <div key={i}>
        {text} Result #{i}
      </div>,
    );
  }
  return <div>{items}</div>;
});

export default function App() {
  const [query, setQuery] = useState("");

  // 1. 生成一个延迟值的副本
  // 当 query 更新时，deferredQuery 在第一次渲染时仍保持旧值
  // 随后 React 会在后台调度一次更新，将 deferredQuery 变为新值
  const deferredQuery = useDeferredValue(query);

  const isStale = query !== deferredQuery; // 可以用来显示 loading 状态

  return (
    <div>
      {/* 输入框绑定原始 query，保证打字无延迟 */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      {/* 可选：给用户一个反馈，告诉他列表正在更新 */}
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {/* 耗时组件绑定 deferredQuery */}
        {/* 注意：SlowList 必须用 memo 包裹，否则父组件重渲染它也会跟着渲染，deferredValue 就失效了 */}
        <SlowList text={deferredQuery} />
      </div>
    </div>
  );
}
