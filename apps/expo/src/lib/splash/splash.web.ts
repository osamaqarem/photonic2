import { SplashService } from "./splash"

export const Splash: SplashService = {
  preventAutoHideAsync: () => Promise.resolve(true),
  hideAsync: () => Promise.resolve(true),
}
