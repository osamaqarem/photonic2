/**
 * @type {import('@babel/core').ConfigFunction}
 */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
          lazyImports: true,
        },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "~/expo": "./src",
          },
        },
      ],
      "react-native-reanimated/plugin",
      ["inline-import", { extensions: [".sql"] }],
    ],
  }
}
