/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@react-native", "../../.eslintrc.cjs"],
  rules: {
    "react-native/no-unused-styles": "warn",
  },
}
