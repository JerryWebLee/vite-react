import { requestTo } from "@/utils";

// 登录
export async function appLogin<P>(data?: P) {
  return requestTo<P, API.LoginData>("post", {
    url: "/auth/login",
    data,
  });
}

// 修改我的密码
export async function changeMyPassword<P>(data?: P) {
  return requestTo<P, boolean>("post", {
    url: "/auth/changeMyPassword",
    data,
  });
}
