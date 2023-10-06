import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as React from "react"

import { theme } from "~/expo/design/theme"
import { MainStack } from "~/expo/navigation/MainStack"
import { OnboardingStack } from "~/expo/navigation/OnboardingStack"
import type { RootStackParams } from "~/expo/navigation/params"

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

const RootStackNavigator = createNativeStackNavigator<RootStackParams>()

export function Navigation() {
  return (
    // @ts-expect-error theme does not accept platform colors
    <NavigationContainer theme={navTheme}>
      <RootStackNavigator.Navigator screenOptions={{ headerShown: false }}>
        <RootStackNavigator.Screen
          name="onboarding"
          component={OnboardingStack}
        />
        <RootStackNavigator.Screen name="main" component={MainStack} />
      </RootStackNavigator.Navigator>
    </NavigationContainer>
  )
}
