import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import * as React from "react"
import { create } from "zustand"

import { theme } from "~/design/theme"
import { MainStack } from "~/navigation/MainStack"
import { OnboardingStack } from "~/navigation/OnboardingStack"

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
      {authenticated ? <MainStack /> : <OnboardingStack />}
    </NavigationContainer>
  )
}
