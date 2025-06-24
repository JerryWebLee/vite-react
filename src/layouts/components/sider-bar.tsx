import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Image, Layout, Menu, type MenuProps } from "antd";
import { StateFullLink } from "@/components/state-full-link";
import { useTheme } from "@/components/theme-provider";
import { MENU_ITEMS } from "@/router";
import { useSelector, useSettingsStore } from "@/stores";

// 递归函数，找到匹配的菜单项
const findSelectedKeys = (items: MenuProps["items"], pathname: string, path: string[] = []) => {
  const selectedKeys: string[] = [];
  let openKeys: string[] = [];

  const travel = (items: MenuProps["items"], pathname: string, path: string[]) => {
    for (const item of items!) {
      if (item!.key === pathname) {
        selectedKeys.push(item!.key);
        openKeys = [...path];
        return;
      }
      if ((item as any).children) {
        path.push(item!.key as string);
        travel((item as any).children, pathname, path);
        path.pop();
      }
    }
  };

  travel(items, pathname, path);
  return { selectedKeys, openKeys };
};

export default function SiderBar() {
  const location = useLocation();

  const firstRenderRef = useRef(true);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const { collapsed } = useSettingsStore(useSelector(["collapsed"]));

  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (location.pathname === "/") return;

    const { selectedKeys, openKeys } = findSelectedKeys(MENU_ITEMS, location.pathname);
    setSelectedKeys(selectedKeys);
    // 首次渲染时，设置默认值
    if (firstRenderRef.current) {
      setOpenKeys(openKeys);
    }
    // 将首次渲染标记设置为false
    firstRenderRef.current = false;
  }, [location.pathname]);

  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={isDarkMode ? "dark" : "light"}
      className="h-screen overflow-auto !sticky top-0 left-0 start-0"
    >
      <StateFullLink
        className="font-bold text-xl hover:text-current h-16 flex justify-center items-center gap-2 text-nowrap"
        to="/"
      >
        <Image width={32} src="/images/content/logo.png" preview={false} />
        {collapsed ? null : <span className="text-gradient-ripple">运维平台</span>}
      </StateFullLink>
      <Menu
        theme={isDarkMode ? "dark" : "light"}
        mode="inline"
        items={MENU_ITEMS}
        selectedKeys={selectedKeys}
        // onSelect={({ selectedKeys }) => setSelectedKeys(selectedKeys)}
        openKeys={openKeys}
        onOpenChange={(openKeys) => setOpenKeys(openKeys)}
        className="!border-e-0"
      />
    </Layout.Sider>
  );
}
