import React from "react";
import { Button, Result } from "antd";
import styled from "styled-components";
import { $navigator } from "@/utils";
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .ant-result-404 {
    .ant-result-image {
      margin-bottom: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: auto;
    }
    .ant-result-title {
      font-weight: 500;
    }
    .ant-result-subtitle {
    }
    .ant-result-extra {
      display: flex;
      justify-content: center;
      align-items: center;
      button {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
`;

export const NoFound: React.FC = () => {
  return (
    <Wrapper>
      <Result
        status="404"
        title="404"
        subTitle={<span style={{}}>页面不存在</span>}
        extra={
          <Button
            type="primary"
            onClick={() => {
              $navigator.replace("/");
            }}
          >
            返回首页
          </Button>
        }
      />
    </Wrapper>
  );
};
