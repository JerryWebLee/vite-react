import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfo extends API.LoginData {}

const initialState: UserInfo = {
  access_token: "",
  token_type: "",
  expires_in: "",
};

export const useUserInfoStore = create<UserInfo>()(persist(() => initialState, { name: "user-info" }));

export function clearUserInfo() {
  useUserInfoStore.persist.clearStorage();
}

export function setUserInfo(user_info: UserInfo) {
  useUserInfoStore.setState({ ...user_info });
}

export function setAccessToken(access_token: UserInfo["access_token"]) {
  useUserInfoStore.setState({ access_token });
}

export function setTokenType(token_type: UserInfo["token_type"]) {
  useUserInfoStore.setState({ token_type });
}

export function setExpiresIn(expires_in?: UserInfo["expires_in"]) {
  useUserInfoStore.setState({ expires_in });
}
