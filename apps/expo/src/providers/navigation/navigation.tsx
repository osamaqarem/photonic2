import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native"
import * as Linking from "expo-linking"
import * as React from "react"

import { useDarkMode } from "src/providers/dark-mode/use-dark-mode"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore avoid nextjs build error for js module
import { colors } from "src/design/tailwind"

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isDarkMode } = useDarkMode()

  const linking = React.useMemo(
    () => ({
      prefixes: [Linking.createURL("/")],
      config: {
        screens: {
          login: "login",
          home: "home",
          photo: "photo/asset:id",
          settings: "settings",
        },
      },
    }),
    [],
  )

  const theme = isDarkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.blue[600],
          text: colors.gray[300],
          background: colors.black[800],
          card: colors.black[600],
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.blue[500],
          text: colors.gray[800],
          background: colors.gray[100],
          card: colors.white,
        },
      }

  return (
    <NavigationContainer theme={theme} linking={linking}>
      {children}
    </NavigationContainer>
  )
}
