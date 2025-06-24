import { Navigate, Outlet as ReactOutlet, OutletProps } from "react-router-dom";
import { ErrorBoundary } from "../error-boundary";
import { useSelector, useUserInfoStore } from "@/stores";

export const Outlet = (props?: OutletProps) => {
  const { access_token } = useUserInfoStore(useSelector(["access_token"]));

  if (!access_token) {
    window.$message?.error("权限失效，请重新登录");
    return <Navigate to="/login" replace />;
  }

  return (
    <ErrorBoundary>
      <ReactOutlet {...props} />
    </ErrorBoundary>
  );
};
