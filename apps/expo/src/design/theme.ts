import type { TextStyle } from "react-native"

import { PlatformColors } from "~/expo/design/platform-colors"
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
    scale: {
      0: 0,
      2: 2,
      4: 4,
      6: 6,
      8: 8,
      10: 10,
      12: 12,
      14: 14,
      16: 16,
      20: 20,
      24: 24,
      30: 30,
      36: 36,
      40: 40,
      44: 44,
      48: 48,
      60: 60,
      72: 72,
      80: 80,
      96: 96,
      112: 112,
      128: 128,
      144: 144,
    },
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
