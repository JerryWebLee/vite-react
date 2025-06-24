import { RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { StateFullLink } from "@/components/state-full-link";
import { ROUTE_PATHS } from "@/constants/common";

export const logsRoute: RouteObject = {
  path: ROUTE_PATHS.logs,
  lazy: async () => ({
    // 这里指向布局容器组件
    Component: (await import("@/pages/logs")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "服务日志",
    crumb: () => <StateFullLink to={ROUTE_PATHS.logs}>服务日志</StateFullLink>,
  },
  children: [
    {
      index: true,
      // 指向父内容组件
      lazy: async () => ({
        Component: (await import("@/pages/logs/parent")).default,
      }),
    },
    {
      path: ROUTE_PATHS.logsList,
      lazy: async () => ({
        Component: (await import("@/pages/logs/list")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "日志列表",
        crumb: () => <StateFullLink to={`${ROUTE_PATHS.logs}/list`}>日志列表</StateFullLink>,
      },
    },
  ],
};
