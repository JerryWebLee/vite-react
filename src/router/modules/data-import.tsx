import { type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { StateFullLink } from "@/components/state-full-link";
import { ROUTE_PATHS } from "@/constants/common";

export const userManagerRoute: RouteObject = {
  path: ROUTE_PATHS.dataImport,
  lazy: async () => ({
    Component: (await import("@/pages/data-import")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "数据导入",
    crumb: () => <StateFullLink to={ROUTE_PATHS.dataImport}>数据导入</StateFullLink>,
  },
};
