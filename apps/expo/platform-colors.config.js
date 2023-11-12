// @ts-check
const { palette } = require("./src/design/palette")

const { light: l, dark: d } = palette

module.exports = {
  colors: {
    accent: {
      light: l.blue.blue6,
      dark: d.blue.blue6,
    },
    background: {
      light: l.slate.slate1,
      dark: d.slate.slate1,
    },
    elementBg: {
      light: l.blue.blue4,
      dark: d.blue.blue4,
    },
    elementBgActive: {
      light: l.blue.blue5,
      dark: d.blue.blue5,
    },
    elementSecondaryBg: {
      light: l.slate.slate3,
      dark: d.slate.slate3,
    },
    elementSecondaryBgActive: {
      light: l.slate.slate4,
      dark: d.slate.slate4,
    },
    text: {
      light: l.slate.slate12,
      dark: d.slate.slate12,
    },
    textLowContrast: {
      light: l.slate.slate11,
      dark: d.slate.slate11,
    },
    border: {
      light: l.slate.slate7,
      dark: d.slate.slate7,
    },
    borderFocused: {
      light: l.slate.slate8,
      dark: d.slate.slate8,
    },
    borderDisabled: {
      light: l.slate.slate6,
      dark: d.slate.slate6,
    },
    loadingIndicator: {
      light: l.blue.blue8,
      dark: d.blue.blue8,
    },
    error: {
      light: l.tomato.tomato11,
      dark: d.tomato.tomato11,
    },
    success: {
      light: d.grass.grass11,
      dark: d.grass.grass11,
    },
    warning: {
      light: d.amber.amber11,
      dark: d.amber.amber11,
    },
    info: {
      light: d.cyan.cyan11,
      dark: d.cyan.cyan11,
    },
  },
  javascript: {
    typescript: true,
    outputDirectory: "./src/design/platform-colors/generated",
  },
  ios: {
    outputDirectory: (() => {
      if (typeof __DEV__ === "boolean") return "Running in RN"

      switch (process.env.STAGE) {
        case "development":
          return `./ios/PhotonicDev/Images.xcassets/`
        case "production":
          return "./ios/Photonic/Images.xcassets/"
        case "storybook":
          return `./ios/PhotonicStorybook/Images.xcassets/`
        default:
          throw new Error(`Unknown stage ${process.env.STAGE}`)
      }
    })(),
  },
}
