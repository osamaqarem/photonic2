import { TextStyle } from "react-native"

import { PlatformColors } from "src/design/platform-colors"
import PlatformColorsConfig from "../../platform-colors.config"

const theme = {
  colors: PlatformColors,
  font: {
    family: "System",
    size: {
      xs: 12,
      s: 14,
      m: 18,
      l: 24,
      xl: 32,
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  space: {
    contentPadding: 24,
  },
} as const

type AppTheme = typeof theme

class Font {
  style: TextStyle = {
    fontFamily: theme.font.family,
    color: theme.colors.text,
  }

  private merge(style: TextStyle) {
    this.style = { ...this.style, ...style }
  }

  size(s: keyof AppTheme["font"]["size"]) {
    this.merge({ fontSize: theme.font.size[s] })
    return this
  }

  weight(w: keyof AppTheme["font"]["weight"]) {
    this.merge({ fontWeight: theme.font.weight[w] })
    return this
  }

  color(c: keyof AppTheme["colors"]) {
    this.merge({ color: theme.colors[c] })
    return this
  }
}

const font = () => new Font()

const rawThemeColors = PlatformColorsConfig.colors

export { theme, AppTheme, rawThemeColors, font }
