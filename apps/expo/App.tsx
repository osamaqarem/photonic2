import * as SplashScreen from "expo-splash-screen"
import * as React from "react"
import { LogBox, StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as Sentry from "sentry-expo"

import { AlertsProvider } from "~/expo/design/components/alerts/AlertsContext"
import { config } from "~/expo/lib/config"
import { Navigation } from "~/expo/navigation/Navigation"
import { DarkModeProvider } from "~/expo/state/DarkModeProvider"
import { TrpcProvider } from "~/expo/state/TrpcProvider"
import { useAuth } from "~/expo/state/auth-store"

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

  useAuth.persist.rehydrate()
}
