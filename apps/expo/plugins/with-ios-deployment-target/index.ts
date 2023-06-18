import type { ConfigPlugin } from "@expo/config-plugins"
import type { ExpoConfig } from "@expo/config-types"
import { withXcodeProject, withPodfileProperties } from "@expo/config-plugins"

const withIosDeploymentTarget =
  (target: string): ConfigPlugin =>
  (expoConfig): ExpoConfig => {
    const step1 = withXcodeProject(expoConfig, modConfig => {
      const buildConfig = modConfig.modResults.hash.project.objects.XCBuildConfiguration

      Object.keys(buildConfig).forEach(key => {
        const buildSettings = buildConfig[key].buildSettings
        if (buildSettings?.IPHONEOS_DEPLOYMENT_TARGET) {
          buildSettings.IPHONEOS_DEPLOYMENT_TARGET = target
        }
      })

      return modConfig
    })

    const step2 = withPodfileProperties(step1, modConfig => {
      modConfig.modResults["ios.deploymentTarget"] = target
      return modConfig
    })

    return step2
  }

export default withIosDeploymentTarget("14.0")
