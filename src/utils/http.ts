import axios, { AxiosRequestConfig, Method } from "axios";
import { getFileNameFromResponse } from "./tools";
import { $navigator } from ".";
import { BASE_URL } from "@/constants/common";
import { useUserInfoStore } from "@/stores";

const UNKNOWN_ERROR = "未知错误";
const http = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: 1000 * 60 * 10,
});

const DownloadReg = /attachment/;

// 需要登录的状态码
//key:后端返回状态码
//value:是否使用后端返回message信息
const needLoginStatus = new Map([
  [403, true],
  [401, true],
]);

const Error_MSG = new Map([
  [403, "抱歉，没有访问权限"],
  [401, "抱歉，权限认证失败"],
]);

http.interceptors.request.use((config) => {
  let data = config.data;
  try {
    if (data) {
      data =
        data instanceof Array
          ? data
          : typeof data === "object"
            ? Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value]),
              )
            : data;
    }
  } catch (error: any) {
    window.$message?.error(error.message || "请求参数格式化报错");
  }
  config.data = data;
  const url = config.url;
  if (url !== "/auth/login") {
    const { access_token, token_type } = useUserInfoStore.getState() || {};
    const tokenOfUser = access_token && token_type ? `${token_type} ${access_token}` : null;
    if (tokenOfUser) {
      config.headers["Authorization"] = `${tokenOfUser}`;
    } else {
      $navigator.replace("/login");
    }
  }
  return config;
});

http.interceptors.response.use(
  (res) => {
    const contentDisposition = (res.headers.get as any)("Content-Disposition");

    // 如果响应体包含Content-Disposition且为attachment，则需要下载响应文件
    if (contentDisposition && DownloadReg.test(contentDisposition)) {
      const filename = getFileNameFromResponse(res.headers["content-disposition"]);
      if (res.status === 200) {
        const _data_ = res.data;

        res.data = {
          code: 0,
          data: {
            data: _data_,
            filename,
          },
        };
      }
    }
    if (res.status == 200 && res.data.code === 0) {
      return res.data;
    }
    if (needLoginStatus.has(res.data.code)) {
      $navigator.replace("/login");
      window.$message?.error(Error_MSG.get(res.data.code));
    } else {
      window.$message?.error(res.data.data || res.data.message || UNKNOWN_ERROR);
    }
    // return Promise.resolve(res.data);
    return Promise.reject(res.data);
  },
  (err) => {
    if (err.response && err.response.status) {
      if (err.response.status === 500) {
        window.$message?.error("服务器异常");
      }
    }
    return Promise.reject(err);
  },
);

export default http;

type OmitProperty<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// `params` 是与请求一起发送的 BASE_URL 参数
// 必须是一个简单对象或 URLSearchParams 对象
// 一般get请求使用params参数
// `data` 是作为请求体被发送的数据
// 仅适用 'PUT', 'POST', 'DELETE 和 'PATCH' 请求方法
// 在没有设置 `transformRequest` 时，则必须是以下类型之一:
// - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
// - 浏览器专属: FormData, File, Blob
// - Node 专属: Stream, Buffer
const URLSearchParamsMethods = ["get"];

export async function requestTo<P = any, D = any, R = any>(
  method?: Method | string,
  info?: OmitProperty<AxiosRequestConfig<P>, "method">,
) {
  // 如果是get请求，则将请求参数设置为params
  if (method && info && URLSearchParamsMethods.includes(method) && !info.params && info.data) {
    info.params = info?.data;
    delete info?.data;
  }

  const data = await http.request<D, { code: number; msg: string; data: D } | R, P>({
    method,
    ...info,
  });

  return data;
}

// export async function requestTo<
//   P = {
//     signal: AbortSignal;
//     queryKey: any[];
//   },
//   D = any,
//   R = any,
// >(method?: Method | string, info?: OmitProperty<AxiosRequestConfig<P>, "method">) {
//   const { data: requestData, url } = info || {};

//   const { signal, queryKey } = requestData as {
//     signal: AbortSignal;
//     queryKey: any[];
//   };

//   const data = queryKey?.[1] || {};

//   return _requestTo_<P, D, R>(method, {
//     url,
//     signal,
//     data,
//   });
// }
