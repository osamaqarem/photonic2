import { ExpoConfig, ConfigContext } from "@expo/config"
import packageConfig from "./package.json"

type VariantConfig = Pick<ExpoConfig, "name" | "scheme" | "ios">

interface Variants {
  development: VariantConfig
  production: VariantConfig
  storybook: VariantConfig
}

const variants: Variants = {
  development: {
    name: "PhotonicDev",
    scheme: "com.osamaqarem.photonic.dev",
    ios: {
      bundleIdentifier: "com.osamaqarem.photonic.dev",
    },
  },
  storybook: {
    name: "PhotonicStorybook",
    scheme: "com.osamaqarem.photonic.storybook",
    ios: {
      bundleIdentifier: "com.osamaqarem.photonic.storybook",
    },
  },
  production: {
    name: "Photonic",
    scheme: "com.osamaqarem.photonic",
    ios: {
      bundleIdentifier: "com.osamaqarem.photonic",
      config: {
        usesNonExemptEncryption: false,
      },
    },
  },
}

const stage = process.env.STAGE as "development" | "production" | "storybook"
if (!stage) throw new Error("Missing STAGE environment variable")
console.log(`Using ${stage} configuration`)

const expoConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ...variants[stage],
  version: packageConfig.version,
  slug: "photonic",
  platforms: ["ios"],
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
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "photonic",
          project: "expo",
        },
      },
    ],
  },
})

export default expoConfig
