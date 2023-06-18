import { StatusBar } from "expo-status-bar"
import { NativeWindStyleSheet } from "nativewind"
import * as React from "react"
import {
  Appearance,
  ColorSchemeName,
  Platform,
  useColorScheme,
} from "react-native"
import { SystemUI } from "@photonic/system-ui"

import { config } from "src/lib/config"
import { storage } from "src/lib/storage"

const ColorSchemeKey = config.STORYBOOK
  ? "ColorSchemeKeyStorybook"
  : "ColorSchemeKey"
type ColorScheme = NonNullable<ColorSchemeName>

const saveColorScheme = (scheme: ColorScheme) =>
  storage.set(ColorSchemeKey, scheme)
const deleteColorScheme = () => storage.delete(ColorSchemeKey)
const getColorScheme = () =>
  storage.getString(ColorSchemeKey) as Maybe<ColorScheme>

interface DarkModeContextType {
  setDark: () => void
  setLight: () => void
  setSystem: () => void
  isDarkMode: boolean
  colorScheme: ColorScheme
  source: "user" | "system"
}

type State = Pick<DarkModeContextType, "isDarkMode" | "source">

export const DarkModeContext =
  React.createContext<Nullable<DarkModeContextType>>(null)

export const DarkModeProvider: React.FC<React.PropsWithChildren> = props => {
  const systemScheme = useColorScheme()

  const [{ isDarkMode, source }, setState] = React.useState<State>({
    isDarkMode: true,
    source: "user",
  })

  React.useEffect(() => {
    const storedColorScheme = getColorScheme()
    if (storedColorScheme) {
      NativeWindStyleSheet.setColorScheme(storedColorScheme)
      setState({ isDarkMode: storedColorScheme === "dark", source: "user" })
    } else {
      const systemScheme = Appearance.getColorScheme()
      const systemOrDark = (systemScheme ??
        "dark") as NonNullable<ColorSchemeName>
      NativeWindStyleSheet.setColorScheme(systemOrDark)
      setState({ isDarkMode: systemOrDark === "dark", source: "system" })
    }
  }, [])

  const setDark = React.useCallback(() => {
    SystemUI.setDark()
    setState({ isDarkMode: true, source: "user" })
    saveColorScheme("dark")
    if (Platform.OS === "web") {
      document.querySelector("body")?.classList.add("dark")
    }
    NativeWindStyleSheet.setColorScheme("dark")
  }, [])

  const setLight = React.useCallback(() => {
    SystemUI.setLight()
    setState({ isDarkMode: false, source: "user" })
    saveColorScheme("light")
    if (Platform.OS === "web") {
      document.querySelector("body")?.classList.remove("dark")
    }
    NativeWindStyleSheet.setColorScheme("light")
  }, [])

  const setSystem = React.useCallback(() => {
    deleteColorScheme()
    const systemScheme = Appearance.getColorScheme()
    const systemOrDark = (systemScheme ??
      "dark") as NonNullable<ColorSchemeName>
    NativeWindStyleSheet.setColorScheme(systemOrDark)

    const systemIsDarkMode = systemOrDark === "dark"
    SystemUI.setSystem()
    setState({ isDarkMode: systemIsDarkMode, source: "system" })

    if (Platform.OS === "web") {
      if (systemIsDarkMode) {
        document.querySelector("body")?.classList.remove("dark")
      } else {
        document.querySelector("body")?.classList.add("dark")
      }
    }
  }, [])

  React.useEffect(() => {
    if (source === "system") {
      setSystem()
    }
  }, [systemScheme, setSystem, source])

  return (
    <DarkModeContext.Provider
      value={{
        setDark,
        setLight,
        setSystem,
        isDarkMode,
        colorScheme: isDarkMode ? "dark" : "light",
        source,
      }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {props.children}
    </DarkModeContext.Provider>
  )
}
