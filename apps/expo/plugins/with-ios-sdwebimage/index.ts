import fs from "fs"
import path from "path"
import { withAppDelegate, WarningAggregator, withDangerousMod } from "@expo/config-plugins"
import type { ConfigPlugin, ExportedConfigWithProps } from "@expo/config-plugins"
import type { ExpoConfig } from "@expo/config-types"

const SDWebImagePhotosPlugin = {
  import: {
    before: `#import "AppDelegate.h"`,
    after: `#import "AppDelegate.h"
#import <SDWebImagePhotosPlugin.h>`,
  },
  init: {
    before: `[super application:application didFinishLaunchingWithOptions:launchOptions]`,
    after: `[super application:application didFinishLaunchingWithOptions:launchOptions];
  SDImageLoadersManager.sharedManager.loaders = @[SDWebImageDownloader.sharedDownloader, SDImagePhotosLoader.sharedLoader];
  SDWebImageManager.defaultImageLoader = SDImageLoadersManager.sharedManager;`,
  },
  pod: {
    before: `post_install do |installer|`,
    after: `pod 'SDWebImagePhotosPlugin'

  post_install do |installer|`,
  },
}

async function updatePodfile(expoConfig: ExportedConfigWithProps) {
  const filePath = path.join(expoConfig.modRequest.platformProjectRoot, "Podfile")
  let podfile = fs.readFileSync(filePath, "utf8")

  if (!podfile.includes(SDWebImagePhotosPlugin.pod.after)) {
    const updated = podfile.replace(
      SDWebImagePhotosPlugin.pod.before,
      SDWebImagePhotosPlugin.pod.after,
    )
    fs.writeFileSync(filePath, updated)
  }
  return expoConfig
}

function updateAppDelegate(appDelegate: string) {
  if (!appDelegate.includes(SDWebImagePhotosPlugin.import.after)) {
    appDelegate = appDelegate.replace(
      SDWebImagePhotosPlugin.import.before,
      SDWebImagePhotosPlugin.import.after,
    )
  }
  if (!appDelegate.includes(SDWebImagePhotosPlugin.init.after)) {
    appDelegate = appDelegate.replace(
      SDWebImagePhotosPlugin.init.before,
      SDWebImagePhotosPlugin.init.after,
    )
  }
  return appDelegate
}

const withIosSDWebImage: ConfigPlugin = (expoConfig: ExpoConfig): ExpoConfig => {
  const step1 = withAppDelegate(expoConfig, config => {
    if (config.modResults.language === "objcpp") {
      config.modResults.contents = updateAppDelegate(config.modResults.contents)
    } else {
      WarningAggregator.addWarningIOS("withIosSDWebImage", "AppDelegate file language has changed.")
    }
    return config
  })

  const step2 = withDangerousMod(step1, ["ios", updatePodfile])

  return step2
}

export default withIosSDWebImage
