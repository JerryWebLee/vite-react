import { Outlet } from "@/components/outlet";

// 这个组件只作为布局容器，渲染当前激活的子路由
export default function LogsLayout() {
  return <Outlet />;
}
