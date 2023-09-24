import * as React from "react"
import { LogBox } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as Sentry from "sentry-expo"

import { AlertsProvider } from "~/design/components/alerts/AlertsContext"
import { config } from "~/lib/config"
import { DarkModeProvider } from "~/stores/DarkModeProvider"
import { Navigation } from "~/navigation/Navigation"
import { TrpcProvider } from "~/stores/TrpcProvider"

export default function App() {
  if (config.stage === "storybook") {
    const { Storybook } = require("~/design/components/Storybook")
    return <Storybook />
  }

  prepare()

  return (
    <SafeAreaProvider>
      <DarkModeProvider>
        <AlertsProvider>
          <TrpcProvider>
            <Navigation />
          </TrpcProvider>
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
    dsn: config.sentryDsn,
    environment: config.stage,
    debug: false,
    enableInExpoDevelopment: false,
    enableNative: false,
  })
}
