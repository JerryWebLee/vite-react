import { type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const versionUpgradeRoute: RouteObject = {
  path: ROUTE_PATHS.versionUpgrade,
  lazy: async () => ({
    Component: (await import("@/pages/version-upgrade")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "版本升级",
  },
};
