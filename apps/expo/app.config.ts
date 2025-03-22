import type { ConfigContext, ExpoConfig } from "@expo/config"
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

const expoConfig = ({ config }: ConfigContext): ExpoConfig => {
  return merge(config, variants[stage], {
    version: packageConfig.version,
    ios: {
      config: {
        usesNonExemptEncryption: false,
      },
      // Update this to real domain
      associatedDomains: [
        `webcredentials:https://photonic-next${
          stage === "development" ? "-staging" : ""
        }.fly.dev`,
      ],
      entitlements: {
        ["aps-environment"]:
          stage === "production" ? "production" : "development",
      },
    },
    slug: "photonic",
    platforms: ["ios"],
    jsEngine: "hermes",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#000",
    },
    plugins: [
      "./plugins/build/with-ios-deployment-target",
      "./plugins/build/with-ios-sdwebimage",
      "./plugins/build/with-ios-entitlements",
      [
        "@sentry/react-native/expo",
        {
          organization: "photonic",
          project: "expo",
        },
      ],
    ],
  } satisfies Partial<ExpoConfig>)
}

export default expoConfig
