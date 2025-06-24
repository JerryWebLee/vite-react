export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-standard-less",
    "stylelint-config-tailwindcss", // 添加这行
  ],
  plugins: ["stylelint-order"],
  rules: {
    "order/properties-alphabetical-order": true,
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,
    "no-descending-specificity": null,
    "font-family-no-missing-generic-family-keyword": null,
    "no-empty-source": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global"],
      },
    ],
    // "at-rule-no-unknown": [
    //   true,
    //   {
    //     ignoreAtRules: ["tailwind", "apply", "variants", "responsive", "screen", "layer"],
    //   },
    // ],
  },
  overrides: [
    {
      files: ["**/*.less"],
      customSyntax: "postcss-less",
    },
  ],
};
