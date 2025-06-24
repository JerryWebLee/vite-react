import { useMemo } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Button, Collapse, Result, theme, Typography } from "antd";
import styled from "styled-components";

export function ErrorFallback({ error, style }: { error: Error; style?: React.CSSProperties }) {
  const { token } = theme.useToken();

  const errorStack = useMemo(() => {
    if (error.stack) {
      const errorString = error.stack;
      const errorName = error.name;
      const errorMessage = error.message; // 获取错误信息
      const stackLines = errorString
        .split(" at ")
        .slice(1) // 去除第一项
        .map((line: string) => {
          return `    at ${line}`; // 替换为你想要的格式
        });

      // 格式化最终输出
      const formattedErrorStack = `${errorName}: ${errorMessage}\n${stackLines.join("\n")}`;
      return formattedErrorStack;
    }
    return "";
  }, [error]);

  return (
    <Wrapper style={style}>
      <Result
        status="warning"
        title={<span>抱歉，页面发生异常</span>}
        subTitle={`异常信息：${error.message ?? "抱歉，页面出错"}`}
        style={{}}
        extra={[
          <Button
            onClick={() => {
              window.location.reload();
            }}
            type="primary"
          >
            刷新重试
          </Button>,
        ]}
      >
        {errorStack && (
          <Collapse
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            style={{
              borderRadius: token.borderRadiusLG,
            }}
            items={[
              {
                key: "errorStack",
                label: <span>异常调用栈信息详情</span>,
                children: (
                  <Typography.Paragraph
                    copyable={{
                      format: "text/plain",
                      text: () => {
                        return errorStack;
                      },
                    }}
                    style={{
                      margin: "-16px",
                    }}
                  >
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1,
                        maxHeight: "600px",
                        overflow: "auto",
                        padding: "16px",
                      }}
                    >
                      {errorStack}
                    </div>
                  </Typography.Paragraph>
                ),
                style: {
                  background: token.colorFillAlter,
                  borderRadius: token.borderRadiusLG,
                  border: "none",
                },
              },
            ]}
          />
        )}
      </Result>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .ant-result {
    width: 100%;
    .ant-result-content {
      padding: 0;
    }
  }
  .ant-result-subtitle {
  }
  .ant-typography {
    position: relative;
    .ant-typography-copy {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 16px;
    }
  }
  .ant-collapse-expand-icon {
  }
  .ant-collapse-content {
  }
`;
