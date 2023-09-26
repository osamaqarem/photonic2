import type { ConfigPlugin } from "@expo/config-plugins"
import type { ExpoConfig } from "@expo/config-types"
import { withEntitlementsPlist } from "@expo/config-plugins"

const withIosEntitlements =
  (entitlements: Record<string, string>): ConfigPlugin =>
  (expoConfig): ExpoConfig => {
    const result = withEntitlementsPlist(expoConfig, modConfig => {
      modConfig.modResults = entitlements
      return modConfig
    })
    return result
  }

export default withIosEntitlements({})
