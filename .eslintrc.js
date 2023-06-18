/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
  },
  extends: ["plugin:@typescript-eslint/recommended", "turbo", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "turbo/no-undeclared-env-vars": 0,
    "react/react-in-jsx-scope": 0,
    "react-native/no-inline-styles": 0,
    "prettier/prettier": 0,
    "prefer-const": 0,
    "no-inner-declarations": 0,
    "no-extra-boolean-cast": 0,
    "no-alert": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-shadow": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-empty-function": 0,
  },
}
