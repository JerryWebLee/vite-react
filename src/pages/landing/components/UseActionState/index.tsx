import UseActionState from "./demo1";
import UseActionStateAndUseTransition from "./demo2";

/*
 * useActionState 是 React 19 引入的一个具有里程碑意义的 Hook。要理解它，我们不能只把它看作一个“表单助手”，而应该把它看作 React 拥抱“全栈交互”和“并发渲染”的核心原语。
 *
 * 一、 要解决的本质问题 (Why)
 * 在 React 19 之前，我们在处理一个异步操作（比如提交表单、发送请求）时，面临三个主要痛点。useActionState 就是为了解决这三个问题而生的：
 *
 * 1. 消除“状态管理的样板代码” (Boilerplate)
 * 旧模式的问题：
 * 为了处理一个请求，你需要手动维护三个状态：data（结果）、isPending（加载中）、error（错误）。
 * 以前的痛苦写法：
 * const [data, setData] = useState(null);
 * const [loading, setLoading] = useState(false);
 * const [error, setError] = useState(null);
 * const handleSubmit = async () => {
 *   setLoading(true); // 1. 手动开启 Loading
 *   try {
 *     const res = await api();
 *     setData(res);   // 2. 手动设置数据
 *   } catch (e) {
 *     setError(e);    // 3. 手动设置错误
 *   } finally {
 *     setLoading(false); // 4. 手动关闭 Loading
 *   }
 * };
 *
 * useActionState 的解法：
 * 它将上述逻辑封装为原子化的原语。React 认为“Action（动作）”本身就应该包含生命周期（开始、进行中、结束），而不应该由开发者手动拼接。
 * const [state, formAction, isPending] = useActionState(addToCart, {
 *   success: true,
 *   message: "",
 *   cartCount: 0,
 * });
 *
 *
 * 2. 实现“渐进式增强” (Progressive Enhancement)
 * 旧模式的问题：
 * 传统的 useState + onSubmit 模式完全依赖 JavaScript。如果用户的网络很慢，JS 包还没下载完，或者 JS 执行报错，点击按钮是没有任何反应的。
 * useActionState 的解法：
 * 它结合了 HTML 原生的 <form action> 属性。
 * JS 未加载时：浏览器会执行原生的 HTTP POST 提交（页面刷新）。
 * JS 加载后：React 接管表单，变成无刷新的 AJAX 请求。
 * useActionState 的设计初衷就是为了让同一套逻辑能同时在服务端（原生提交处理）和客户端（Hydration 后的处理）运行。
 *
 *
 * 3. 深度集成“并发模式” (Concurrent React)
 * 旧模式的问题：
 * 当我们设置 setLoading(true) 时，React 会触发一次高优先级的同步渲染。如果后续计算量大，可能会阻塞 UI。
 * useActionState 的解法：
 * 它基于 React 的 Transition API (startTransition)。
 * 当 Action 执行时，状态更新被标记为“过渡更新”。这意味着：
 * UI 不会冻结：即使 Action 处理很慢，用户依然可以点击其他地方。
 * 自动 Pending：React 能够通过追踪 Transition 的状态来自动推导出 isPending，而不需要手动切换布尔值。
 *
 */

export default function UseActionStatePage() {
  return (
    <div>
      <UseActionState />
      <UseActionStateAndUseTransition />
    </div>
  );
}
