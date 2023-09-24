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
            "~": "./src",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  }
}
