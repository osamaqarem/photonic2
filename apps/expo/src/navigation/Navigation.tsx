import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import * as React from "react"
import { create } from "zustand"

import { theme } from "~/expo/design/theme"
import { OnboardingStack } from "~/expo/navigation/OnboardingStack"

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.accent,
    text: theme.colors.text,
    background: theme.colors.background,
    card: theme.colors.elementBg,
  },
}

export const useAuth = create(() => ({
  authenticated: false,
}))

export function Navigation() {
  const authenticated = useAuth(state => state.authenticated)

  return (
    // @ts-expect-error theme does not accept platform colors
    <NavigationContainer theme={navTheme}>
      {/* TODO: main stack */}
      {authenticated ? null : <OnboardingStack />}
    </NavigationContainer>
  )
}
