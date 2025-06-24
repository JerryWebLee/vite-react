import { Key } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSafeState } from "ahooks";
import { Button, Divider, Flex, Form, Input, Modal, Popconfirm, Table, type TableProps, Tooltip } from "antd";
import { ROUTE_PATHS } from "@/constants/common";
import { useConfigProviderPropsStore, useSelector } from "@/stores";
import { $navigator } from "@/utils";

import { LogsController } from "@/services";

export default function Func() {
  const { componentSize } = useConfigProviderPropsStore(useSelector(["componentSize"]));
  const [isAdd, setIsAdd] = useSafeState(false);
  const [form] = Form.useForm<API.ServiceFormItemData>();
  const [selectedRows, setSelectedRows] = useSafeState<API.ServiceTableItemData[]>([]);
  const [editRecord, setEditRecord] = useSafeState<API.ServiceTableItemData>();

  const GetAppList = useQuery<API.ResponseData<API.ServiceTableItemData[]>>({
    queryKey: ["LoginController.connApp"],
    queryFn: () => LogsController.getAppList(),
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: true,
    // staleTime: Infinity,
    // gcTime: Infinity,
    // staleTime: 3000,
    // gcTime: 3000,
  });
  const AddApp = useMutation<API.ResponseData, Error, API.ServiceFormItemData>({
    mutationFn: (values) => LogsController.addApp<API.ServiceFormItemData>(values),
    onSuccess: () => {
      GetAppList.refetch();
      setIsAdd(false);
    },
  });

  const UpdateApp = useMutation<API.ResponseData, Error, API.ServiceTableItemData>({
    mutationFn: (values) => LogsController.updateApp<API.ServiceTableItemData>(values),
    onSuccess: () => {
      window.$message?.success("修改成功");
      GetAppList.refetch();
      setEditRecord(undefined);
    },
  });

  const GetAppStatus = useMutation<API.ResponseData, Error, API.ServiceTableItemData>({
    mutationFn: (values) => LogsController.getStatus<API.ServiceTableItemData>(values),
    onSuccess: (res) => {
      if (res.code === 0 && res.data) {
        window.$message?.success("连接正常");
      } else {
        window.$message?.error("连接异常");
      }
    },
  });

  const DelApp = useMutation<
    API.ResponseData,
    Error,
    {
      ids: API.ServiceTableItemData["id"][];
    }
  >({
    mutationFn: (values) =>
      LogsController.delApp<{
        ids: API.ServiceTableItemData["id"][];
      }>(values),
    onSuccess: () => {
      window.$message?.success("删除成功");
      setSelectedRows([]);
      GetAppList.refetch();
    },
  });

  const columns: TableProps<API.ServiceTableItemData>["columns"] = [
    {
      title: "应用名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "应用IP",
      dataIndex: "ip",
      align: "center",
      key: "ip",
    },
    {
      title: "端口",
      dataIndex: "port",
      align: "center",
      key: "port",
    },
    {
      title: "路径前辍",
      dataIndex: "path",
      align: "center",
      key: "path",
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (_: any, record: API.ServiceTableItemData) => {
        return (
          <Flex gap={componentSize} justify="center">
            <Button
              onClick={() => {
                GetAppStatus.mutate(record);
              }}
              type="primary"
            >
              状态检测
            </Button>
            <Tooltip title="日志列表">
              <Button
                onClick={() => {
                  $navigator.push(ROUTE_PATHS.logsList, {
                    state: {
                      record,
                      from: ROUTE_PATHS.logs,
                    },
                  });
                }}
                type="primary"
                icon={<TableOutlined />}
              ></Button>
            </Tooltip>
            <Tooltip title="修改">
              <Button
                onClick={() => {
                  setEditRecord(record);
                  form.setFieldsValue(record);
                }}
                type="primary"
                icon={<EditOutlined />}
              ></Button>
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                okButtonProps={{
                  loading: DelApp.isPending,
                }}
                onConfirm={() => {
                  DelApp.mutate({
                    ids: [record.id],
                  });
                }}
                title="确认删除？"
                autoAdjustOverflow
              >
                <Button type="primary" icon={<DeleteOutlined />} danger></Button>
              </Popconfirm>
            </Tooltip>
          </Flex>
        );
      },
    },
  ];

  return (
    <>
      <Flex gap={componentSize}>
        <Tooltip title="新增">
          <Button
            onClick={() => {
              setIsAdd(true);
            }}
            type="primary"
            icon={<PlusOutlined />}
          ></Button>
        </Tooltip>
        <Tooltip title="批量删除">
          <Popconfirm
            okButtonProps={{
              loading: DelApp.isPending,
            }}
            onConfirm={() => {
              if (!selectedRows.length) return window.$message?.warning("请选择要删除的条目");
              DelApp.mutate({
                ids: selectedRows.map((item) => item.id),
              });
            }}
            title="确认删除？"
            placement="right"
            autoAdjustOverflow
          >
            <Button type="primary" icon={<DeleteOutlined />} danger></Button>
          </Popconfirm>
        </Tooltip>
      </Flex>
      <Divider />
      <Modal
        open={isAdd || !!editRecord}
        onOk={() => {
          form.validateFields().then((values) => {
            isAdd && AddApp.mutate(values);
            !!editRecord &&
              UpdateApp.mutate({
                ...editRecord,
                ...values,
              });
          });
        }}
        onCancel={() => {
          isAdd && setIsAdd(false);
          editRecord && setEditRecord(undefined);
        }}
      >
        <Form name="logsForm" form={form} layout="vertical">
          <Form.Item
            label="应用名称"
            name="name"
            rules={[
              {
                required: true,
                message: "请输入应用名称",
              },
            ]}
            normalize={(value) => value?.trim()}
          >
            <Input maxLength={50} showCount />
          </Form.Item>
          <Form.Item
            label="应用IP"
            name="ip"
            rules={[
              {
                required: true,
                message: "请输入应用IP",
              },
              {
                pattern:
                  /^(?!0)(?!.*\.$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                message: "请输入有效的IP地址",
              },
            ]}
            normalize={(value) => value?.trim()}
          >
            <Input maxLength={15} showCount />
          </Form.Item>
          <Form.Item
            label="端口"
            name="port"
            rules={[
              {
                required: true,
                message: "请输入端口",
              },
              {
                pattern:
                  /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
                message: "端口号必须为 0-65535 之间的数字",
              },
            ]}
            normalize={(value) => value?.trim()}
          >
            <Input maxLength={5} showCount />
          </Form.Item>
          <Form.Item
            label="路径前辍"
            name="path"
            normalize={(value) => value?.trim()}
            rules={[
              {
                pattern: /^\/[a-zA-Z0-9\-_]+(\/[a-zA-Z0-9\-_]+)*$/,
                message: "路径必须以 / 开头，且只允许字母、数字、'-' 和 '_'（如 /api/v1）",
              },
            ]}
          >
            <Input maxLength={100} showCount />
          </Form.Item>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={GetAppList.data?.data || []}
        loading={GetAppList.isLoading || GetAppList.isRefetching}
        rowKey="id"
        rowSelection={{
          type: "checkbox",
          selectedRowKeys: selectedRows.map((item) => {
            return item.id;
          }),
          onChange(_: Key[], _selectedRows: API.ServiceTableItemData[]) {
            setSelectedRows(_selectedRows);
          },
        }}
      />
    </>
  );
}
