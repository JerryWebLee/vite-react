import { ProgressBar } from "@/components/progress-bar";
export const notFoundRoute = {
  path: "*",
  lazy: async () => ({
    Component: (await import("@/pages/not-found")).default,
  }),
  HydrateFallback: ProgressBar,
};
