import * as React from "react"
import { LogBox } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { AlertsProvider } from "src/design/components/alerts/alerts-context"
import { useAuth } from "src/hooks/auth/use-auth"
import { config } from "src/lib/config"
import { Sentry } from "src/lib/sentry"
import { DarkModeProvider } from "src/providers/dark-mode/dark-mode"
import { NavigationProvider } from "src/providers/navigation/navigation"
import { MainStack } from "src/navigation/native/main-stack"

export default function App() {
  if (config.STORYBOOK) {
    // TODO: gets imported anyway on web
    const { Storybook } = require("src/design/components/storybook")
    return <Storybook />
  }

  prepare()

  return (
    <SafeAreaProvider>
      <DarkModeProvider>
        <NavigationProvider>
          <AlertsProvider>
            <MainStack />
          </AlertsProvider>
        </NavigationProvider>
      </DarkModeProvider>
    </SafeAreaProvider>
  )
}

function prepare() {
  LogBox.ignoreLogs([
    // sentry-expo
    "Constants.platform.ios.model has been deprecated",
    // expo-splash-screen
    "No native splash screen registered for given view controller",
  ])

  Sentry.init({
    dsn: config.SENTRY_DSN,
    debug: false,
    enableInExpoDevelopment: false,
  })

  useAuth.getState().actions.hydrate()
}
