import { SystemUI } from "@photonic/system-ui"
import * as React from "react"
import { Appearance, ColorSchemeName } from "react-native"
import { SharedValue, useSharedValue } from "react-native-reanimated"
import { create } from "zustand"

import { config } from "~/lib/config"
import { storage } from "~/lib/storage"

const ColorSchemeKey =
  config.stage === "storybook" ? "ColorSchemeKeyStorybook" : "ColorSchemeKey"

export type ColorScheme = NonNullable<ColorSchemeName>

const ColorSchemeStorage = {
  get: () => storage.getString(ColorSchemeKey) as Maybe<ColorScheme>,
  save: (scheme: ColorScheme) => storage.set(ColorSchemeKey, scheme),
  delete: () => storage.delete(ColorSchemeKey),
}

interface DarkModeStore {
  colorScheme: ColorScheme
  sharedColorScheme: SharedValue<ColorScheme>
  source: "system" | "user"
  actions: {
    setMode: (cs: ColorScheme) => void
    setSystem: (cs: ColorScheme) => void
    setSharedValue: (sv: SharedValue<ColorScheme>) => void
  }
}

export const useDarkMode = create<DarkModeStore>((set, get) => ({
  colorScheme: "light",
  sharedColorScheme: { value: "light" },
  source: "system",
  actions: {
    setMode: colorScheme => {
      const sharedColorScheme = get().sharedColorScheme

      set({ colorScheme, source: "user" })
      sharedColorScheme.value = colorScheme
      SystemUI.setMode(colorScheme)
      ColorSchemeStorage.save(colorScheme)
    },
    setSystem: colorScheme => {
      const sharedColorScheme = get().sharedColorScheme

      set({ colorScheme, source: "system" })
      sharedColorScheme.value = colorScheme
      SystemUI.setMode("system")
      ColorSchemeStorage.delete()
    },
    setSharedValue: sharedValue => {
      set({ sharedColorScheme: sharedValue })
    },
  },
}))

export const DarkModeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [hydrated, setHydrated] = React.useState(false)

  const sharedValue = useSharedValue(useDarkMode.getState().colorScheme)

  const { actions } = useDarkMode.getState()

  const source = useDarkMode(state => state.source)

  React.useEffect(
    function hydrate() {
      actions.setSharedValue(sharedValue)

      const storedColorScheme = ColorSchemeStorage.get()
      if (storedColorScheme) {
        actions.setMode(storedColorScheme)
      } else {
        const systemScheme = Appearance.getColorScheme()
        const systemOrDark = (systemScheme ??
          "dark") as NonNullable<ColorSchemeName>
        actions.setSystem(systemOrDark)
      }

      setHydrated(true)
    },
    [actions, sharedValue],
  )

  React.useEffect(
    function listenToSystem() {
      if (!hydrated || source !== "system") return
      const sub = Appearance.addChangeListener(event => {
        const { colorScheme } = event
        if (colorScheme) {
          actions.setSystem(colorScheme)
        }
      })
      return sub.remove
    },
    [sharedValue, actions, hydrated, source],
  )

  if (!hydrated) return null

  return <>{children}</>
}
