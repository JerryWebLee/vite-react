/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// 环境变量
interface ImportMetaEnv {
  readonly VITE_APP_BASE_NAME: string;
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_BASE_URL_TARGET: string;
  readonly VITE_APP_TITLE_SUFFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const VITE_APP_BASE_NAME: string;
declare const VITE_APP_BASE_URL: string;
declare const VITE_APP_TITLE_SUFFIX: string;
