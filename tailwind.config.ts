import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      colors: {
        primary: "var(--ant-color-primary)",
      },
    },
  },
  plugins: [
    plugin(function ({ matchVariant, addVariant }) {
      // https://tailwindcss.com/docs/plugins#adding-variants
      addVariant("hocus", ["&:hover", "&:focus"]);
      // https://tailwindcss.com/docs/plugins#dynamic-variants
      matchVariant("override", (value) => {
        return `& ${value}`;
      });
    }),
  ],
} satisfies Config;
