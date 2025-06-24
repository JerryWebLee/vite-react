import { CSSProperties } from "react";
export const BASE_URL = `${location.origin}${VITE_APP_BASE_URL}`;
export const BASE_WS_URL = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;

export const LINEAR_GRADIENT_TEXT = {
  background: "linear-gradient(0deg, #FAFF6C 0%, #FDFFE1 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
} as CSSProperties;

export const ROUTE_PATHS = {
  login: "/login",
  notFound: "/not-found",
  landing: "/landing",
  logs: "/logs",
  logsList: "/logs/list",
  dataImport: "/data-import",
  dataBackup: "/data-backup",
  versionUpgrade: "/version-upgrade",
};
