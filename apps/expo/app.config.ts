import type { ExpoConfig, ConfigContext } from "@expo/config"
import merge from "lodash.merge"

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
    },
  },
}

const stage = process.env.STAGE as "development" | "production" | "storybook"
if (!stage) throw new Error("Missing STAGE environment variable")

const expoConfig = ({ config }: ConfigContext): ExpoConfig =>
  merge(config, variants[stage], {
    version: packageConfig.version,
    ios: {
      config: {
        usesNonExemptEncryption: false,
      },
      // Update this to real domain
      associatedDomains: [
        `webcredentials:https://photonic-remix${
          stage === "development" ? "-staging" : ""
        }.fly.dev`,
      ],
    },
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
  } satisfies Partial<ExpoConfig>)

export default expoConfig
