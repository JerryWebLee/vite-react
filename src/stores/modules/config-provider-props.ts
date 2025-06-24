import { ConfigProviderProps } from "antd";
import { create } from "zustand";

const initialState: ConfigProviderProps = {
  componentSize: "middle",
};

export const useConfigProviderPropsStore = create<typeof initialState>()(() => initialState);

export function setComponentSize(componentSize: ConfigProviderProps["componentSize"]) {
  useConfigProviderPropsStore.setState({ componentSize });
}
