import * as React from "react"
import { LogBox, StyleSheet } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as Sentry from "sentry-expo"
import * as SplashScreen from "expo-splash-screen"

import { AlertsProvider } from "~/expo/design/components/alerts/AlertsContext"
import { config } from "~/expo/lib/config"
import { Navigation } from "~/expo/navigation/Navigation"
import { DarkModeProvider } from "~/expo/stores/DarkModeProvider"
import { TrpcProvider } from "~/expo/stores/TrpcProvider"
import { useAuth } from "~/expo/stores/auth-store"
import { deviceIdStorage } from "~/expo/lib/device-id"

let didInit = false

export default function App() {
  if (config.stage === "storybook") {
    const { Storybook } = require("~/expo/design/components/Storybook")
    return <Storybook />
  }

  if (!didInit) {
    prepare()
    didInit = true
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DarkModeProvider>
          <AlertsProvider>
            <TrpcProvider>
              <Navigation />
            </TrpcProvider>
          </AlertsProvider>
        </DarkModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})

function prepare() {
  SplashScreen.preventAutoHideAsync()

  LogBox.ignoreLogs([
    // sentry-expo
    "Constants.platform.ios.model has been deprecated",
    // expo-splash-screen
    "No native splash screen registered for given view controller",
    "`useBottomSheetDynamicSnapPoints`",
  ])

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.stage,
    debug: false,
    enableInExpoDevelopment: false,
    enableNative: false,
  })

  useAuth.getState().actions.hydrate()
  deviceIdStorage.maybeCreate()
}
