// hooks/withRouteLeaveCleanup.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// HOC 在 useEffect 的清理函数中处理离开逻辑
export function withRouteLeaveCleanup(WrappedComponent: React.ComponentType): React.FC {
  return function ComponentWithCleanup() {
    const navigate = useNavigate();

    useEffect(() => {
      return () => {
        // 组件卸载时清理 state（模拟离开回调）
        navigate(".", { state: null, replace: true });
      };
    }, [navigate]);

    return <WrappedComponent />;
  };
}
