// src/types/icons.d.ts
declare module "~icons/*" {
  import type { SVGProps } from "react";

  // 声明为 React 组件
  const component: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  export default component;
}
