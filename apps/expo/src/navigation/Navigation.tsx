import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import * as SplashScreen from "expo-splash-screen"
import * as React from "react"
import { Loading } from "~/expo/design/components/Loading"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"

import { theme } from "~/expo/design/theme"
import { db } from "~/expo/lib/db"
import migrations from "~/expo/lib/db/migrations/migrations"
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
    card: theme.colors.elementSecondaryBg,
  },
}

const RootStackNavigator = createNativeStackNavigator<RootStackParams>()

export function Navigation() {
  const { hydrated, accessToken, onboardingDone } = useAuth()
  const { success, error } = useMigrations(db, migrations)
  const { showError } = useAlerts()

  const onNavigationReady = () => {
    SplashScreen.hideAsync()
  }

  if (error) {
    showError(`Migration error: ${error.message}}`)
  }
  if (!hydrated || !success) return <Loading />

  return (
    // @ts-expect-error theme does not accept platform colors
    <NavigationContainer theme={navTheme} onReady={onNavigationReady}>
      <RootStackNavigator.Navigator screenOptions={{ headerShown: false }}>
        {accessToken && onboardingDone ? (
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
