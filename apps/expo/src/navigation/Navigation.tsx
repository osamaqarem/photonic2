import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as React from "react"
import * as SplashScreen from "expo-splash-screen"

import { theme } from "~/expo/design/theme"
import { MainStack } from "~/expo/navigation/MainStack"
import { OnboardingStack } from "~/expo/navigation/OnboardingStack"
import type { RootStackParams } from "~/expo/navigation/params"
import { useAuth } from "~/expo/stores/auth-store"

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
  const { hydrated, accessToken } = useAuth()

  const onNavigationReady = () => SplashScreen.hideAsync()

  if (!hydrated) return null

  return (
    // @ts-expect-error theme does not accept platform colors
    <NavigationContainer theme={navTheme} onReady={onNavigationReady}>
      <RootStackNavigator.Navigator screenOptions={{ headerShown: false }}>
        {accessToken ? (
          <RootStackNavigator.Screen name="main" component={MainStack} />
        ) : (
          <RootStackNavigator.Screen
            name="onboarding"
            component={OnboardingStack}
          />
        )}
      </RootStackNavigator.Navigator>
    </NavigationContainer>
  )
}
