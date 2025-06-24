import { NavigateOptions } from "react-router-dom";
import { router } from "@/router";
export const $navigator = {
  push(path: string, opts?: NavigateOptions) {
    router.navigate(path, opts);
  },
  replace(path: string, opts?: NavigateOptions) {
    router.navigate(path, {
      ...opts,
      replace: true,
    });
  },
};
