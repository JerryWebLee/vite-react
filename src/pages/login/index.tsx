import { Helmet } from "react-helmet-async";
import { Card, Image, Layout, Typography } from "antd";
import { ThemeSwitch } from "@/components/theme-switch";
import LoginForm from "./components/login-form";
export default function Login() {
  return (
    <>
      <Helmet>
        <title>{`登录页 | ${String(import.meta.env.VITE_APP_TITLE_SUFFIX || "")}`}</title>
      </Helmet>
      <Layout className="min-h-screen relative">
        <Layout.Content className="flex">
          <div className="w-2/5 bg-[url('/images/content/content_bg.jpg')] bg-[length:100%_100%] bg-no-repeat hidden md:flex justify-center items-center">
            <div className="w-[80%] bg-[url('/images/content/middle_bg.png')] bg-[length:100%_100%] bg-no-repeat hidden md:flex justify-center items-center">
              <Image width={200} src="/images/content/logo.png" preview={false} />
            </div>
          </div>
          <div className="w-screen md:w-3/5 flex justify-center items-center">
            <Card
              title={
                <Typography.Title level={2} className="flex justify-center pt-8 pb-4">
                  {import.meta.env.VITE_APP_TITLE_SUFFIX}
                </Typography.Title>
              }
              className="w-[450px]"
            >
              <LoginForm />
            </Card>
          </div>
        </Layout.Content>
        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>
      </Layout>
    </>
  );
}
