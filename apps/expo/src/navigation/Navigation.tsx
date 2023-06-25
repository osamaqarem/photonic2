import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native"
import * as React from "react"
import { theme } from "src/design/theme"

import { OnboardingStack } from "src/navigation/OnboardingStack"

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

export function Navigation() {
  return (
    // @ts-expect-error theme does not accept platform colors
    <NavigationContainer theme={navTheme}>
      <OnboardingStack />
    </NavigationContainer>
  )
}
