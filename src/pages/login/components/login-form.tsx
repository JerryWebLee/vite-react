import { useEffect } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, type FormProps, Input } from "antd";
import { ROUTE_PATHS } from "@/constants/common";
import { clearUserInfo, setUserInfo } from "@/stores";
import { $navigator } from "@/utils";

import { LoginController } from "@/services";

type LoginParams = {
  username?: string;
  password?: string;
};

export default function LoginForm() {
  const AppLogin = useMutation<API.ResponseData<API.LoginData>, Error, LoginParams>({
    mutationFn: (values: LoginParams) => LoginController.appLogin<LoginParams>(values),
    onSuccess: (res) => {
      $navigator.push(ROUTE_PATHS.landing);
      setUserInfo(res.data);
      window.$notification?.success({
        message: "登录成功",
        description: "欢迎回来",
      });
    },
  });

  const onFinish: FormProps<LoginParams>["onFinish"] = (values) => {
    AppLogin.mutate(values);
  };

  const onFinishFailed: FormProps<LoginParams>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    clearUserInfo();
  }, []);

  return (
    <Form
      initialValues={{ username: "devops", password: "123456" }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item name="username" rules={[{ required: true, message: "请输入手机号" }]}>
        <Input addonBefore={<UserOutlined />} placeholder="请输入手机号" />
      </Form.Item>

      <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
        <Input.Password addonBefore={<LockOutlined />} placeholder="请输入密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={AppLogin.isPending}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
