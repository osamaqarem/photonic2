import * as ExpoSplashScreen from "expo-splash-screen"

export const Splash = {
  preventAutoHideAsync: ExpoSplashScreen.preventAutoHideAsync,
  hideAsync: ExpoSplashScreen.hideAsync,
}

export type SplashService = typeof Splash
