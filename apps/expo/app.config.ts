import "dotenv/config"
import { ExpoConfig, ConfigContext } from "@expo/config"

const expoConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Photonic",
  slug: "photonic",
  version: "1.0.0",
  scheme: "com.osamaqarem.photonic",
  platforms: ["ios", "android"],
  ios: {
    bundleIdentifier: "com.osamaqarem.photonic",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.osamaqarem.photonic",
  },
  jsEngine: "hermes",
  userInterfaceStyle: "automatic",
  splash: {
    image:
      "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000",
  },
  plugins: [
    "./plugins/build/with-ios-deployment-target",
    "./plugins/build/with-ios-sdwebimage",
    "./plugins/build/with-ios-entitlements",
    "sentry-expo",
  ],
  extra: {
    STAGE: process.env.STAGE,
    DOMAIN: process.env.DOMAIN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    STORYBOOK: Boolean(process.env.STORYBOOK),
  },
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "photonic",
          project: "expo",
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
})

export default expoConfig
