import {
  forwardRef,
  memo,
  Ref,
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useSafeState, useUpdateEffect } from "ahooks";
import { Button, Flex, List, Typography } from "antd";
import { nanoid } from "nanoid";
import VirtualList, { ListRef } from "rc-virtual-list";
import styled from "styled-components";
import { LogsListFilterFormParams } from "..";
import { BASE_WS_URL, ROUTE_PATHS } from "@/constants/common";
import { useSelector, useUserInfoStore } from "@/stores";
import { $navigator } from "@/utils";

import { LogsController } from "@/services";
const { Text } = Typography;
interface LogContent {
  logContent: string;
  id: string;
}

export interface LogCodeBlockRef {
  closeWs: () => void;
  searchWs: (search: string) => void;
  startWs: () => void;
}

const pageSize = 20; // 每次加载的日志条数

function Func(
  {
    options,
    isScrolling,
    onScroll,
  }: {
    onScroll?: React.UIEventHandler<HTMLElement>;
    isScrolling?: boolean;
    options: API.ServiceTableItemData & LogsListFilterFormParams;
  },
  ref: Ref<LogCodeBlockRef>,
) {
  type LogDataParamsData = API.ServiceTableItemData &
    LogsListFilterFormParams & { code: string; search?: string };
  const { access_token } = useUserInfoStore(useSelector(["access_token"]));
  const connectCodeRef = useRef<string>("");
  const [content, setContent] = useSafeState<LogContent[]>([]);
  const defferContent = useDeferredValue(content);
  const virtualListRef = useRef<ListRef>(null); // 添加 ref 用于 VirtualList
  const listRef = useRef<HTMLDivElement>(null); // 添加 ref 用于 List
  const [page, setPage] = useSafeState<number>(1); // 当前页码
  const [search, setSearch] = useSafeState<string>("");
  const currentPageData = useMemo(() => {
    const total = defferContent.length;

    // 计算倒序索引
    const start = Math.max(0, total - page * pageSize);
    const end = Math.max(0, total - (page - 1) * pageSize);

    // 返回当前页数据（仍然保持原顺序，但取的是最新的数据）
    return defferContent.slice(start, end);
  }, [defferContent, page]);

  const [height, setHeight] = useSafeState<number>(600); // 设置初始高度

  const StartIncrLog = useMutation<API.ResponseData, Error, LogDataParamsData>({
    mutationFn: (values) => LogsController.startIncrLog<LogDataParamsData>(values),
    onSuccess: () => {},
  });

  useEffect(() => {
    const handleResize = () => {
      if (listRef.current) {
        const newHeight = listRef.current.clientHeight; // 减去一些边距
        setHeight(newHeight);
      }
    };
    // 监听窗口大小变化
    window.addEventListener("resize", handleResize);
    // 初始化高度
    handleResize();
    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setHeight]);

  // 添加自动滚动效果
  useEffect(() => {
    if (virtualListRef.current && isScrolling) {
      virtualListRef.current.scrollTo({
        index: currentPageData.length - 1,
        align: "bottom",
      });
    }
  }, [currentPageData, isScrolling]);

  const CloseIncrLog = useMutation<API.ResponseData, Error, LogDataParamsData>({
    mutationFn: (values) => LogsController.closeIncrLog<LogDataParamsData>(values),
    onSuccess: () => {},
  });

  // const prevCloseIncrLog = useRef(CloseIncrLog);
  // useEffect(() => {
  //   if (prevCloseIncrLog.current !== CloseIncrLog) {
  //     console.log("CloseIncrLog 引用变化了！");
  //     prevCloseIncrLog.current = CloseIncrLog;
  //   }
  // }, [CloseIncrLog]);

  useImperativeHandle(
    ref,
    () => ({
      searchWs: (search: string) => {
        setSearch(search);
        if (!connectCodeRef.current) {
          connectCodeRef.current = nanoid(32); // 生成新的连接代码
        }
        StartIncrLog.mutate({
          ...options,
          code: connectCodeRef.current, // 使用 ref 来存储 code
          search,
        });
      },
      startWs: () => {
        if (!connectCodeRef.current) {
          connectCodeRef.current = nanoid(32); // 生成新的连接代码
        }
        StartIncrLog.mutate({
          ...options,
          code: connectCodeRef.current, // 使用 ref 来存储 code
          search,
        });
      },
      closeWs: () => {
        CloseIncrLog.mutate({
          ...options,
          code: connectCodeRef.current,
        });
        connectCodeRef.current = "";
        CloseIncrLog.isSuccess && window.$message?.success("连接已关闭");
      },
    }),
    [CloseIncrLog, StartIncrLog, options, connectCodeRef, search, setSearch], // 添加依赖项,
  );

  useUpdateEffect(() => {
    if (!(options && connectCodeRef.current)) return;
    if (!access_token) {
      $navigator.replace(ROUTE_PATHS.login);
      return window.$message?.error("请先登录");
    }
    if (!StartIncrLog.data?.data) {
      return;
    }
    const { ip, port, logName } = options;
    const wsurl = `${BASE_WS_URL}${import.meta.env.VITE_APP_BASE_URL}/websocket/logs/${ip}/${port}/${connectCodeRef.current}/${logName}?access_token=${access_token}`;
    const socket: WebSocket = new WebSocket(wsurl);

    socket.onopen = (ws) => {
      switch ((ws.target as Event & WebSocket)!.readyState) {
        case WebSocket.CONNECTING:
          console.log("连接中");
          break;
        case WebSocket.OPEN:
          console.log("已连接");
          break;
        case WebSocket.CLOSING:
          console.log("关闭中");
          break;
        case WebSocket.CLOSED:
          console.log("已关闭");
          break;
        default:
          console.log("WebSocket状态异常");
          break;
      }
    };
    let messageQueue: any[] = []; // 消息队列
    let lastRenderTime = 0;
    const renderInterval = 500; // 每200ms最多渲染一次
    socket.onmessage = async (message) => {
      try {
        const res = JSON.parse(message.data);
        messageQueue.push({
          ...res,
          id: nanoid(32),
        });

        const now = Date.now();
        if (now - lastRenderTime >= renderInterval) {
          setContent((prev) => [...prev, ...messageQueue]);
          messageQueue = []; // 清空队列
          lastRenderTime = now;
        }
      } catch (error) {
        window.$message?.error("解析日志内容失败: " + (error instanceof Error ? error.message : "未知错误"));
      }
    };
    socket.onerror = function (error) {
      console.error("error: ", error);
    };
    socket.onclose = function () {
      console.log("Websocket连接已关闭");
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
        console.log("Websocket连接已清理");
      }
    };
  }, [StartIncrLog.data, options, access_token]);

  useEffect(() => {
    return () => {
      if (connectCodeRef.current) {
        CloseIncrLog.mutate({
          ...options,
          code: connectCodeRef.current, // 使用 ref 来存储 code
        });
        connectCodeRef.current = ""; // 清除连接代码
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <>
      <ListWrapper ref={listRef} className="h-full">
        <VirtualList
          onScroll={onScroll}
          height={height}
          ref={virtualListRef}
          data={currentPageData}
          itemKey="id"
        >
          {(item: LogContent) => (
            <List.Item key={item.id}>
              <Text copyable={{ text: item.logContent }} style={{ width: "100%" }}>
                <pre className="whitespace-pre-wrap break-all">{item.logContent}</pre>
              </Text>
            </List.Item>
          )}
        </VirtualList>
      </ListWrapper>
      <Flex className="absolute top-[-20px] right-0" justify="center" align="center">
        <Button
          size="small"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          type="primary"
          icon={<LeftOutlined />}
        ></Button>
        <span style={{ margin: "0 10px" }}>第{page}页</span>
        <span style={{ margin: "0 10px" }}>共{Math.ceil(defferContent.length / pageSize)}页</span>
        <Button
          size="small"
          disabled={page >= Math.ceil(defferContent.length / pageSize)}
          onClick={() => setPage((prev) => prev + 1)}
          type="primary"
          icon={<RightOutlined />}
        ></Button>
      </Flex>
    </>
  );
}

export const LogCodeBlock = memo(forwardRef(Func));

const ListWrapper = styled(List)`
  .ant-spin-nested-loading {
    height: 100%;
    .ant-spin-container {
      height: 100%;
    }
  }
`;
