import * as React from "react"
import { LogBox } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as Sentry from "sentry-expo"

import { AlertsProvider } from "src/design/components/alerts/AlertsContext"
// import { useAuth } from "src/hooks/use-auth/useAuth"
import { config } from "src/lib/config"
import { DarkModeProvider } from "src/stores/dark-mode/DarkModeProvider"
import { Navigation } from "src/navigation/Navigation"

export default function App() {
  if (config.STORYBOOK) {
    const { Storybook } = require("src/design/components/Storybook")
    return <Storybook />
  }

  prepare()

  return (
    <SafeAreaProvider>
      <DarkModeProvider>
        <AlertsProvider>
          <Navigation />
        </AlertsProvider>
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

  // useAuth.getState().actions.hydrate()
}
