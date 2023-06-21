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
    card: {
      light: l.slate.slate3,
      dark: d.slate.slate3,
    },
    text: {
      light: l.slate.slate12,
      dark: d.slate.slate12,
    },
    label: {
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
    error: {
      light: l.tomato.tomato11,
      dark: d.tomato.tomato11,
    },
    success: {
      light: d.grass.tomato11,
      dark: d.grass.tomato11,
    },
    warning: {
      light: d.amber.tomato11,
      dark: d.amber.tomato11,
    },
    info: {
      light: d.cyan.tomato11,
      dark: d.cyan.tomato11,
    },
  },
  javascript: {
    typescript: true,
    outputDirectory: "./src/design/platform-colors/generated",
  },
  ios: {
    outputDirectory: "./ios/Photonic/Images.xcassets/",
  },
}
