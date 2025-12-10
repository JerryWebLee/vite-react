import { startTransition, useActionState } from "react";
import { Button, Form, Input, InputNumber } from "antd";

/* 
这是一个非常经典的问题。

导致 isPending 一直为 false 的核心原因是：useActionState 返回的 formAction 是为了配合原生 <form action={formAction}> 使用的。

当你像在 Antd 中那样，在 onFinish 回调里手动调用 formAction(formData) 时，React 有时无法自动将这次执行识别为一个 "Transition"（过渡任务），因此它不会更新 isPending 状态。

解决方案：使用 startTransition 包裹调用
你需要显式地告诉 React：“这次手动调用是一个过渡任务”。

原理解析：
1. 声明式 vs 命令式：

当你写 <form action={formAction}> 时，React 自动为你处理了所有事情：它拦截提交事件，启动一个 Transition，设置 isPending 为 true，执行 Action，最后更新 UI。
当你写 formAction(formData)（命令式调用）时，这只是一个普通的函数调用。虽然它会触发 Server Action，但 React 可能不会将其视为需要跟踪“Pending”状态的高优先级 UI 转换，或者在某些 React 19 版本中，手动调用默认不包含 Transition 上下文。
2. startTransition 的作用：

startTransition(() => { ... }) 显式地告诉 React：“这里面发生的更新（包括 Action 的执行）是一个过渡任务”。
useActionState 内部会监听当前的 Transition 状态。一旦被包裹在 startTransition 中，Hook 返回的 isPending 就会在异步操作期间变为 true。

*/

// 1. 定义 Action 函数
// previousState: 上一次的状态
// formData: 表单提交的数据
async function addToCart(
  previousState: { success: boolean; message: string; cartCount: number },
  formData: FormData,
) {
  const itemID = formData.get("itemID");
  const quantity = formData.get("quantity") || 0;

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 简单的验证逻辑
  if (parseInt(quantity as string) <= 0) {
    return {
      success: false,
      message: "数量必须大于 0",
      cartCount: previousState.cartCount, // 保持原样
    };
  }

  // 成功逻辑
  return {
    success: true,
    message: `成功添加了 ${quantity} 个商品 (ID: ${itemID})`,
    cartCount: previousState.cartCount + parseInt(quantity as string),
  };
}

export default function ProductPage() {
  // 2. 使用 useActionState
  // 初始状态为：{ success: true, message: '', cartCount: 0 }
  const [state, formAction, isPending] = useActionState(addToCart, {
    success: true,
    message: "",
    cartCount: 0,
  });

  return (
    <div className="p-4 border rounded shadow-md w-96">
      <h2 className="text-xl font-bold mb-4">购物车总数: {state.cartCount}</h2>

      <Form
        onFinish={(values) => {
          const formData = new FormData();
          Object.keys(values).forEach((key) => {
            if (values[key] !== undefined && values[key] !== null) {
              formData.append(key, values[key]);
            }
          });
          // 2. 关键修改：使用 startTransition 包裹手动调用，否则isPending状态会无法正常更新
          startTransition(() => {
            formAction(formData);
          });
        }}
        className="flex flex-col gap-3"
      >
        <Form.Item name="itemID" hidden initialValue={"123"}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="quantity" label="数量">
          <InputNumber />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>
            {isPending ? "添加中..." : "添加到购物车"}
          </Button>
        </Form.Item>
        <Form.Item label="消息">
          {!state.success && <p className="text-red-500">{state.message}</p>}
          {state.success && state.message && <p className="text-green-500">{state.message}</p>}
        </Form.Item>
      </Form>
    </div>
  );
}
