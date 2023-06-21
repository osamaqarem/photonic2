import { TextStyle } from "react-native"

import { palette } from "src/design/palette"
import { PlatformColors } from "src/design/platform-colors"
import PlatformColorsConfig from "../../platform-colors.config"

const rawThemeColors = PlatformColorsConfig.colors

export { palette, rawThemeColors }

export type AppTheme = typeof theme

export const theme = {
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

class Font {
  style: TextStyle = {
    fontFamily: theme.font.family,
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

export const font = () => new Font()
