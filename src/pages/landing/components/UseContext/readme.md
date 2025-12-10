useContext 是 React Hooks 中非常重要的一个 Hook，用于在函数组件中订阅和消费 Context（上下文）。

以下是关于 useContext 的详细用法、核心原理及其解决的问题的深度解析。

一、 主要作用：解决什么问题？核心痛点：Prop Drilling（属性透传/层层传递）

在 React 的单向数据流中，数据通常通过 props 从父组件传递给子组件。如果组件层级很深（例如：App -> Layout -> Header -> UserAvatar），而你需要在 UserAvatar 中使用 App 中的 user 数据：

你必须将 user 属性一层层传下去。中间的 Layout 和 Header 根本不需要 user 数据，但它们必须被迫接收并传递这个 prop。useContext 的作用：它提供了一种跨越组件层级直接传递数据的方法。它就像一个“虫洞”或“传送门”，允许深层嵌套的组件直接获取顶层组件的数据，而无需通过中间组件手动传递。

适用场景：

全局主题（Theme：亮色/暗色）当前认证用户（User Auth）多语言设置（Locale）全局状态管理（配合 useReducer）二、 详细用法（三步走）使用 Context 主要分为三个步骤：创建 (Create) -> 提供 (Provide) -> 消费 (Consume)。

1. 创建 Context 首先，使用 React.createContext 创建一个 Context 对象。

```
// ThemeContext.js
import React from 'react';

// 创建 Context，可以传入默认值（当组件上方没有匹配的 Provider 时生效）
export const ThemeContext = React.createContext('light');
```

2. 提供 Context (Provider)

在组件树的上层，使用 <ThemeContext.Provider> 包裹子组件，并通过 value 属性传递数据。

```
// App.js
import React, { useState } from 'react';
import { ThemeContext } from './ThemeContext';
import Toolbar from './Toolbar';

export default function App() {
  const [theme, setTheme] = useState('dark');

  return (
    // 凡是被包裹在 Provider 内部的组件，都可以访问到 value
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          切换主题
        </button>
        <Toolbar />
      </div>
    </ThemeContext.Provider>
  );
}
```

3. 消费 Context (useContext)

在深层子组件中，使用 useContext 钩子读取数据。

```
// ThemedButton.js
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export default function ThemedButton() {
  // 核心：传入 Context 对象，返回当前的 value
  const contextValue = useContext(ThemeContext);

  // 解构出我们需要的数据
  const { theme } = contextValue;

  return (
    <button style={{ background: theme === 'dark' ? '#333' : '#FFF', color: theme === 'dark' ? '#FFF' : '#000' }}>
      我是 {theme} 风格的按钮
    </button>
  );
}
```

三、 核心实现原理虽然我们不需要阅读 React 源码的每一行，但理解其设计思想对于通过面试和解决 Bug 至关重要。

1. 注册依赖 (Dependency Registration)

当一个组件调用 useContext(MyContext) 时，React 内部发生以下事情：

- React 运行时（Fiber Reconciler）会获取当前正在渲染的组件节点（Fiber Node）。
- 它会在该 Fiber 节点上创建一个链表，记录该组件依赖了哪些 Context。
- 这就建立了一个订阅关系：组件 -> 订阅了 -> MyContext。

2. 查找值 (Value Lookup)

useContext 如何知道值是多少？

- React 会从当前组件的 Fiber 节点开始，向上遍历组件树（Parent Fiber）。
- 它寻找最近的匹配的 Context.Provider 节点。
- 一旦找到，就读取该 Provider 的 value。
- 如果没有找到 Provider，则使用 createContext(defaultValue) 时传入的默认值。

3. 变更传播与更新 (Propagation & Update) 这是最关键的部分。当 Provider 的 value 发生变化时：

- 比较： React 使用 Object.is() 算法比较新旧 value。如果引用不同，React 认为 Context 变了。
- 向下遍历： React 开始向下遍历子树。
- 触发渲染： React 查找所有订阅了该 Context 的组件（通过步骤1中的链表）。
- 强制更新： 即使这些消费组件被 React.memo 包裹，或者它们的父组件没有更新，useContext 也会强制让当前组件重新渲染。

四、 性能优化与注意事项（进阶）这是 useContext 使用中最大的坑，也是高级面试常考点。

1. 避免不必要的重渲染

由于 Context 使用 Object.is 比较，如果 Provider 的 value 每次渲染都是一个新的对象，会导致所有消费者组件强制重渲染。

错误写法：

```
// 每次 App 重渲染，都会创建一个新的对象 { theme, setTheme }
<ThemeContext.Provider value={{ theme, setTheme }}>
   <ChildComponent />
</ThemeContext.Provider>
```

正确写法（使用 useMemo）：

```
const value = useMemo(() => ({ theme, setTheme }), [theme]);

<ThemeContext.Provider value={value}>
   <ChildComponent />
</ThemeContext.Provider>
```

2. Context 的拆分

如果一个 Context 中包含很多无关的数据（例如 user 和 theme），当 theme 改变时，只依赖 user 的组件也会重新渲染。

优化方案： 将 Context 拆分为多个小的 Context。

- UserContext
- ThemeContext

或者将 State 和 Dispatch 拆分：

- TodosContext (存放数据)
- TodosDispatchContext (存放 setState 函数) -> 这样只调用 dispatch 的组件不会因为数据变化而重渲染。

3. Context 不是银弹

不要滥用 Context。

- 如果是为了解决“由父传子，子传孙”这种简单的传递，考虑使用 组件组合 (Component Composition)，即直接将组件作为 children 或 prop 传递，可能比 Context 更清晰。
- 对于高频更新的状态（如拖拽位置、动画帧），Context 性能较差，因为会触发大范围的重渲染，建议使用专门的状态管理库（如 Redux, Zustand, Recoil）或 React 18 的 useSyncExternalStore。

五、 总结

目的： 解决 Props Drilling，实现跨层级数据共享。

用法： createContext -> Provider (value) -> useContext。

原理： 消费者组件向 React 注册依赖；Provider 值变化时，React 强制更新所有订阅了该 Context 的组件（穿透 React.memo）。

注意： 必须配合 useMemo 缓存 Context 的 value 对象，防止无意义的性能损耗。
