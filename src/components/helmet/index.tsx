import { Helmet } from "react-helmet-async";
import { useMatches } from "react-router-dom";
import { at } from "@/utils";

export function AppHelmet() {
  const matches = useMatches();
  const currRouter = at(matches, -1);

  // 确保 title 是字符串类型
  const pageTitle = String((currRouter?.handle as any)?.title || "React");
  const appTitle = String(import.meta.env.VITE_APP_TITLE_SUFFIX || "");

  return (
    <Helmet>
      <title>{`${pageTitle} | ${appTitle}`}</title>
    </Helmet>
  );
}
