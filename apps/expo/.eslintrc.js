/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@react-native", "../../.eslintrc.js"],
  rules: {
    "react-native/no-unused-styles": "warn",
  },
}
