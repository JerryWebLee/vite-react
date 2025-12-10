import { useActionState, useTransition } from "react";
import { Button, Form, Input, InputNumber } from "antd";

/* 
这是一个非常经典的问题。

导致 isPending 一直为 false 的核心原因是：useActionState 返回的 formAction 是为了配合原生 <form action={formAction}> 使用的。

当你像在 Antd 中那样，在 onFinish 回调里手动调用 formAction(formData) 时，React 有时无法自动将这次执行识别为一个 "Transition"（过渡任务），因此它不会更新 isPending 状态。

备选方案：使用 useTransition
如果你觉得直接引入全局 startTransition 有点奇怪，也可以使用 useTransition Hook，效果是一样的：

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
  // 单独创建一个 transition 控制器
  const [isPending, startTransition] = useTransition();
  // 2. 使用 useActionState
  // 初始状态为：{ success: true, message: '', cartCount: 0 }
  const [state, formAction] = useActionState(addToCart, {
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
