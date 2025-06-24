import { requestTo } from "@/utils";

// 获取服务列表
export async function getAppList<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/getAppList",
    data,
  });
}

// 添加服务
export async function addApp<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/addApp",
    data,
  });
}

// 修改服务
export async function updateApp<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/updateApp",
    data,
  });
}
// 删除服务
export async function delApp<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/delApp",
    data,
  });
}
// 检测状态
export async function getStatus<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/getStatus",
    data,
  });
}
// 获取服务日志列表
export async function getLogList<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/getLogList",
    data,
  });
}

// 获取服务全量日志
export async function getLogUrl<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/getLogUrl",
    data,
  });
}

// 开启服务增量日志
export async function startIncrLog<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/startIncrLog",
    data,
  });
}

// 关闭服务增量日志
export async function closeIncrLog<P>(data?: P) {
  return requestTo<P, any>("post", {
    url: "/logs/closeIncrLog",
    data,
  });
}
