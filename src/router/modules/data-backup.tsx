import { type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { StateFullLink } from "@/components/state-full-link";
import { ROUTE_PATHS } from "@/constants/common";

export const dataBackupRoute: RouteObject = {
  path: ROUTE_PATHS.dataBackup,
  lazy: async () => ({
    Component: (await import("@/pages/data-backup")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "数据备份",
    crumb: () => <StateFullLink to={ROUTE_PATHS.dataBackup}>数据备份</StateFullLink>,
  },
};
