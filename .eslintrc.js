module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: ["pug", "@typescript-eslint", "prettier"],
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "plugin:vue-pug/vue3-recommended",
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    requireConfigFile: false,
  },
  rules: {
    // Customize ESLint rules here
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
  overrides: [
    {
      files: ["**/*.vue"],
      rules: {
        "vue/html-indent": ["error", 2],
        "vue/html-closing-bracket-newline": [
          "error",
          {
            singleline: "never",
            multiline: "always",
          },
        ],
        "vue/component-name-in-template-casing": ["error", "PascalCase"],
        "pug/attribute-value-quotes": ["error", "single"],
        "pug/no-duplicate-attributes": "error",
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: ["pug", "pug-plain-loader", "sass-loader"] },
        ],
      },
    },
  ],
};
