module.exports = {
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ["node_modules/", "dist/"],
  plugins: ["pug", "@typescript-eslint", "prettier", "import"],
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "plugin:vue-pug/vue3-recommended",
    "prettier",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    requireConfigFile: false,
    extraFileExtensions: [".vue"],
  },
  rules: {
    // Customize ESLint rules here
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "@typescript-eslint/no-explicit-any": "error",
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    "import/no-extraneous-dependencies": "error",
  },
  overrides: [
    {
      files: ["**/*.vue"],
      rules: {
        "vue/no-parsing-error": [2, { "x-invalid-end-tag": false }],
        "@typescript-eslint/no-explicit-any": "error",
        "vue/html-indent": ["error", 2],
        "vue/html-closing-bracket-newline": [
          "error",
          {
            singleline: "never",
            multiline: "always",
          },
        ],
        "vue/component-name-in-template-casing": ["error", "kebab-case"],
        "prettier/prettier": "error",
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: ["pug", "pug-plain-loader", "sass-loader"] },
        ],
      },
    },
  ],
};
