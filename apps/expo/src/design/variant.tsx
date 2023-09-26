import { rawThemeColors } from "~/expo/design/theme"
import type { ColorScheme } from "~/expo/stores/DarkModeProvider"

export const getThemeColorWorklet =
  (path: keyof typeof rawThemeColors) => (cs: ColorScheme) => {
    "worklet"
    return rawThemeColors[path][cs]
  }

export const getAnyColorWorklet = (color: string) => () => {
  "worklet"
  return color
}

export type ComponentVariantMap<Keys extends string, Value> = {
  [K in Keys]: Value
}
