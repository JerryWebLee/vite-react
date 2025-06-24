import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { CloudSyncOutlined, CloudUploadOutlined, FileSearchOutlined, HomeOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";
import { ProgressBar } from "@/components/progress-bar";
import { StateFullLink } from "@/components/state-full-link";
import { dataBackupRoute } from "./modules/data-backup";
import { userManagerRoute } from "./modules/data-import";
import { landingRoute } from "./modules/landing";
import { logsRoute } from "./modules/logs";
import { notFoundRoute } from "./modules/not-found";
import { versionUpgradeRoute } from "./modules/version-upgrade";
import { ROUTE_PATHS } from "@/constants/common";

import IconUpgrade from "~icons/carbon/upgrade";

const routes: RouteObject[] = [
  {
    path: ROUTE_PATHS.login,
    lazy: async () => ({
      Component: (await import("@/pages/login")).default,
    }),
    HydrateFallback: ProgressBar,
  },
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("@/layouts")).default,
    }),
    HydrateFallback: ProgressBar,
    children: [
      {
        index: true,
        element: <Navigate replace to={ROUTE_PATHS.landing} />,
      },
      landingRoute,
      logsRoute,
      userManagerRoute,
      dataBackupRoute,
      versionUpgradeRoute,
      // 404
      notFoundRoute,
    ],
  },
  notFoundRoute,
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_APP_BASE_NAME,
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export const MENU_ITEMS: MenuProps["items"] = [
  {
    icon: <HomeOutlined />,
    label: <StateFullLink to={ROUTE_PATHS.landing}>首页</StateFullLink>,
    key: ROUTE_PATHS.landing,
  },
  {
    icon: <FileSearchOutlined />,
    label: <StateFullLink to={ROUTE_PATHS.logs}>服务日志</StateFullLink>,
    key: ROUTE_PATHS.logs,
  },
  {
    icon: <CloudUploadOutlined />,
    label: <StateFullLink to={ROUTE_PATHS.dataImport}>数据导入</StateFullLink>,
    key: ROUTE_PATHS.dataImport,
  },
  {
    icon: <CloudSyncOutlined />,
    label: <StateFullLink to={ROUTE_PATHS.dataBackup}>数据备份</StateFullLink>,
    key: ROUTE_PATHS.dataBackup,
  },
  {
    icon: <IconUpgrade />,
    label: <StateFullLink to={ROUTE_PATHS.versionUpgrade}>版本升级</StateFullLink>,
    key: ROUTE_PATHS.versionUpgrade,
  },
];
