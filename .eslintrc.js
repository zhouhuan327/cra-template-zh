const fs = require("fs");
const path = require("path");
// 配置文件更新了2
const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, ".prettierrc"), "utf8"),
);

module.exports = {
  extends: [
    "react-app",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint",
  ],
  plugins: ["prettier", "react-hooks"],
  rules: {
    "prettier/prettier": ["error", prettierOptions],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      rules: { "prettier/prettier": ["warn", prettierOptions] },
    },
  ],
};
