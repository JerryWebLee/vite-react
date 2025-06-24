import { Card, Divider, Flex } from "antd";
import { MENU_ITEMS } from "@/router";
import { $navigator } from "@/utils";
const gridStyle: React.CSSProperties = {
  width: "25%",
  textAlign: "center",
};

export default function LandingPage() {
  return (
    <>
      <Flex justify="center">
        <h1 className="text-gradient-ripple text-[32px] font-bold">
          欢迎来到{import.meta.env.VITE_APP_TITLE_SUFFIX}
        </h1>
      </Flex>
      <Divider />
      <Card title="首页门户导航">
        {MENU_ITEMS?.slice(1).map((item) => {
          return (
            <Card.Grid key={(item as any).key} style={gridStyle}>
              <Flex
                onClick={() => {
                  $navigator.push((item as any).key);
                }}
                className="cursor-pointer w-full h-full"
                align="center"
                justify="space-between"
                vertical
              >
                <Flex className="h-full text-[24px] flex-1" justify="center" align="center">
                  {(item as any).icon}
                </Flex>
                <strong>{(item as any).label}</strong>
              </Flex>
            </Card.Grid>
          );
        })}
      </Card>
    </>
  );
}
