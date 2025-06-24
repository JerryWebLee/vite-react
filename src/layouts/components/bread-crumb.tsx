import { useMatches } from "react-router-dom";
import { Breadcrumb as AntdBreadcrumb } from "antd";
import { StateFullLink } from "@/components/state-full-link";

export default function Breadcrumb() {
  const matches = useMatches();
  const items = matches
    .filter((match) => Boolean((match.handle as any)?.crumb))
    .map((match) => ({
      title: (match.handle as any)?.crumb?.(),
    }));

  return <AntdBreadcrumb items={[{ title: <StateFullLink to="/landing">首页</StateFullLink> }, ...items]} />;
}
