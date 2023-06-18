import { Platform } from "react-native"
import * as SentryExpo from "sentry-expo"

type AppPlatforms = Include<typeof Platform.OS, "ios" | "android" | "web">
type SentryPlatforms = Include<keyof typeof SentryExpo, "Native" | "Browser">

const SentryPlatformMap: Record<AppPlatforms, SentryPlatforms> = {
  android: "Native",
  ios: "Native",
  web: "Browser",
}

const SentryPlatformInstance = SentryExpo[SentryPlatformMap[Platform.OS as AppPlatforms]]

export const Sentry = {
  init: SentryExpo.init,
  captureException: SentryPlatformInstance.captureException,
  captureMessage: SentryPlatformInstance.captureMessage,
}
