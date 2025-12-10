import UseCallback from "./demo1";

/*
 *
 * useCallback 是 React 中用于性能优化的一个 Hook。它的核心作用是缓存函数引用，防止组件在重新渲染（Re-render）时创建新的函数实例。
 * const cachedFn = useCallback(fn, dependencies);
 *
 * fn: 你想要缓存的回调函数。
 * dependencies: 依赖数组（类似于 useEffect 的依赖项）。
 * 返回值: 返回该函数的 memoized（记忆化） 版本。
 *  1. 只要依赖项没有发生变化，返回的函数引用就保持不变。
 *  2. 一旦依赖项改变，它会返回一个新的函数。
 *
 * useCallback vs useMemo
 * 两者非常相似，区别在于缓存的对象不同：
 * useMemo: 缓存函数的执行结果（返回值）。
 * useCallback: 缓存函数本身。
 * 公式：useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
 *
 * 什么时候不需要（不应该）使用 useCallback？
 *
 * 在以下情况中，使用它通常是负优化：
 * 1. 简单的原生 DOM 事件：
 * <button onClick={() => setCount(count + 1)}>Click me</button>
 *
 * 2. 子组件没有使用 React.memo：
 * 如果你传给子组件的回调函数使用了 useCallback，但子组件并没有用 React.memo 包裹，那么子组件依然会每次都重渲染。你只付出了 useCallback 的性能成本，却没得到任何收益。
 *
 * 3.过度优化：
 * 对于轻量级的组件，频繁创建函数的开销微乎其微。只有当渲染极其昂贵（如大列表、复杂图表）或因为引用变化导致 Bug 时，才考虑使用。
 *
 *
 * 总结
 * 目的：保持函数引用稳定。
 * 核心配合：必须配合 React.memo 或 PureComponent 使用才能减少子组件渲染。
 * 依赖管理：诚实地填写依赖数组，善用 setState(c => c + 1) 来移除对 state 的依赖。
 * 避免滥用：不要在所有函数上都套一层，只在需要优化性能或稳定依赖时使用。
 */

export default function UseCallbackPage() {
  return (
    <>
      {/* 场景一：配合 React.memo 优化子组件渲染 */}
      <UseCallback />
    </>
  );
}
