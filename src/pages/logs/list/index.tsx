import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { DownloadOutlined, RollbackOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useSafeState, useUpdateEffect } from "ahooks";
import {
  Button,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Switch,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from "antd";
import { LogCodeBlock, LogCodeBlockRef } from "./components/LogCodeBlock";
import { ROUTE_PATHS } from "@/constants/common";
import { useConfigProviderPropsStore, useSelector } from "@/stores";
import { $navigator, downloadLogFile } from "@/utils";

import { LogsController } from "@/services";

const { Title } = Typography;
export interface LogsListFilterFormParams {
  logName?: string;
}
export default function LogsList() {
  const logCodeBlockRef = useRef<LogCodeBlockRef>(null);

  const { componentSize } = useConfigProviderPropsStore(useSelector(["componentSize"]));
  const [pageInfo, setPageInfo] = useSafeState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: 10,
  });
  const { state } = useLocation();
  const [form] = Form.useForm<LogsListFilterFormParams>();
  const [filterFormParams, setFilterFormItems] = useSafeState<LogsListFilterFormParams>();
  const [logRecord, setLogRecord] = useSafeState<API.ServiceTableItemData & LogsListFilterFormParams>();
  const [isScrolling, setIsScrolling] = useSafeState<boolean>(false);
  const [search, setSearch] = useSafeState<string>("");
  const GetLogList = useQuery<
    API.ResponseData<API.LogListItemData[]>,
    Error,
    API.ResponseData<API.LogListItemData[]>,
    [string, API.ServiceTableItemData & LogsListFilterFormParams]
  >({
    queryKey: [
      "LogsController.getLogList",
      {
        ...(state?.record ?? {}),
        ...(filterFormParams ?? {}),
      },
    ],
    enabled: !!state?.record, // 确保只有在有记录时才执行查询
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
    queryFn: (req) => LogsController.getLogList<API.ServiceTableItemData>(req.queryKey[1]),
    // refetchInterval: 5000, // 每5秒重新获取一次
    refetchIntervalInBackground: false, // 即使窗口不在焦点也继续轮询
  });

  useUpdateEffect(() => {
    return () => {
      console.log("LogsList 组件卸载，清除状态");
      // 组件卸载时清除状态
      $navigator.replace(".", { state: null });
    };
  }, []);

  async function getLogUrl(params: API.ServiceTableItemData & LogsListFilterFormParams) {
    try {
      const res = await LogsController.getLogUrl<API.ServiceTableItemData & LogsListFilterFormParams>(params);
      if (res.code === 0) {
        try {
          await downloadLogFile(res.data);
          window.$message?.success("下载日志成功");
        } catch (error) {
          window.$message?.error(error instanceof Error ? error.message : "下载日志失败");
        }
      }
    } catch (error) {
      console.error("获取日志失败:", error);
    }
  }

  const columns: TableProps<API.LogListItemData>["columns"] = [
    {
      title: "日志名称",
      dataIndex: "logName",
      key: "logName",
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (_: any, record: API.LogListItemData) => {
        return (
          <Flex gap={componentSize} justify="center">
            <Tooltip title="下载">
              <Button
                onClick={() => {
                  getLogUrl({
                    ...(state?.record ?? {}),
                    ...record,
                  });
                }}
                type="primary"
                icon={<DownloadOutlined />}
              ></Button>
            </Tooltip>
            {/* <Tooltip title="实时日志">
              <Button
                onClick={() => {
                  console.log("setLogRecord: ");

                  setLogRecord({
                    ...(state?.record ?? {}),
                    ...record,
                  });
                }}
                type="primary"
                icon={<RealtimeLogIcon />}
              ></Button>
            </Tooltip> */}
          </Flex>
        );
      },
    },
  ];

  return (
    <>
      <Drawer
        onClose={() => {
          setLogRecord(undefined);
        }}
        open={!!logRecord}
        width={"100%"}
        title={
          <Flex align="center" justify="space-between" className="w-full">
            <span>{`${logRecord?.name || ""} ${logRecord?.logName || ""} 实时日志`}</span>
            <Flex gap={componentSize} align="center">
              <span className="whitespace-nowrap">日志查询：</span>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                allowClear
              />
              <Button
                type="primary"
                onClick={(ev) => {
                  ev.stopPropagation();
                  // if (!search) return window.$message?.warning("查询内容不能为空");
                  if (logCodeBlockRef.current) {
                    logCodeBlockRef.current.searchWs(search);
                  }
                }}
              >
                查询
              </Button>
              {/* <Button
                type="primary"
                onClick={() => {
                  if (logCodeBlockRef.current) {
                    logCodeBlockRef.current.startWs();
                  }
                }}
              >
                开始
              </Button> */}
              <Button
                type="primary"
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (logCodeBlockRef.current) {
                    logCodeBlockRef.current.closeWs();
                  }
                }}
              >
                停止
              </Button>
            </Flex>
            <div>
              <span>实时滚动：</span>
              <Switch
                value={isScrolling}
                onChange={(value) => {
                  setIsScrolling(value);
                }}
              />
            </div>
          </Flex>
        }
        destroyOnClose
      >
        <div className="h-full relative">
          <LogCodeBlock ref={logCodeBlockRef} options={logRecord!} isScrolling={isScrolling} />
        </div>
      </Drawer>
      <Flex>
        <Button icon={<RollbackOutlined />} onClick={() => $navigator.push(ROUTE_PATHS.logs)} type="primary">
          返回
        </Button>
        <Flex flex={1} justify="center" align="center">
          <Title level={5} style={{ margin: 0 }}>
            {state?.record?.name} {state?.record?.ip}:{state?.record?.port}
            {state?.record?.path}
          </Title>
        </Flex>
      </Flex>
      <Divider />
      <Form
        name="logsListForm"
        form={form}
        layout="inline"
        style={{ marginTop: 16 }}
        onFinish={(values) => {
          setFilterFormItems(values);
        }}
      >
        <Form.Item label="日志名称" name="logName">
          <Input />
        </Form.Item>
        <Form.Item>
          <Flex gap={componentSize}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button
              type="default"
              onClick={() => {
                form.resetFields();
                const values = form.getFieldsValue();
                setFilterFormItems(values);
              }}
            >
              重置
            </Button>
          </Flex>
        </Form.Item>
      </Form>
      <Divider />
      <Table
        columns={columns}
        dataSource={GetLogList.data?.data || []}
        loading={GetLogList.isLoading || GetLogList.isRefetching}
        rowKey="logName"
        pagination={{
          pageSize: pageInfo.pageSize,
          current: pageInfo.page,
          showTotal: (total) => `总共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
          total: GetLogList.data?.data?.length || 0,
          onChange: (page, pageSize) => {
            setPageInfo({ page, pageSize });
          },
        }}
      />
    </>
  );
}
