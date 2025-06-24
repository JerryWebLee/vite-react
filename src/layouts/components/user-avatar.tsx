import { EditOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useSafeState } from "ahooks";
import { Avatar, Dropdown, Form, Input, type MenuProps, Modal } from "antd";
import { ROUTE_PATHS } from "@/constants/common";
import { $navigator } from "@/utils";

import { LoginController } from "@/services";
type ChangeMyPasswordParams = {
  username?: string;
  password?: string;
};

export default function UserAvatar() {
  const [form] = Form.useForm();
  const [open, setOpen] = useSafeState(false);

  const ChangeMyPassword = useMutation<API.ResponseData, Error, ChangeMyPasswordParams>({
    mutationFn: (values) => LoginController.changeMyPassword<ChangeMyPasswordParams>(values),
    onSuccess: () => {
      $navigator.replace(ROUTE_PATHS.login);
      window.$message?.success("密码修改成功，请重新登录");
      setOpen(false);
    },
  });

  const items: MenuProps["items"] = [
    {
      key: "modPassword",
      label: (
        <>
          <EditOutlined className="mr-2" /> 修改密码
        </>
      ),
      onClick: () => {
        setOpen(true);
      },
    },
    {
      key: "loginOut",
      label: (
        <>
          <LogoutOutlined className="mr-2" /> 退出登录
        </>
      ),
      onClick: () => {
        $navigator.push(ROUTE_PATHS.login);
      },
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={["click"]}>
        <Avatar icon={<UserOutlined />} size={36} className="cursor-pointer"></Avatar>
      </Dropdown>
      <Modal
        title={"修改密码"}
        open={open}
        onOk={() => {
          form.validateFields().then((values) => {
            ChangeMyPassword.mutate(values);
          });
        }}
        onCancel={() => {
          setOpen(false);
        }}
        confirmLoading={ChangeMyPassword.isPending}
      >
        <Form
          labelCol={{
            span: 4,
          }}
          name="modPwdForm"
          form={form}
          requiredMark={false}
        >
          <Form.Item name="password" label="旧密码" rules={[{ required: true, message: "请输入原密码！" }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码！" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="重新输入"
            rules={[
              { required: true, message: "请重新输入新密码！" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("两次输入的密码不一致!");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
