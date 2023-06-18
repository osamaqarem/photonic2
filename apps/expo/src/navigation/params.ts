import { GenericAsset } from "src/features/photo/list/models/asset"

export type OnboardingStackParams = {
  welcome: undefined
  login: undefined
  "onboarding-storage": undefined
  "onboarding-permissions": undefined
  "onboarding-settings": undefined
}

export type MainStackParams = {
  home: undefined
  photo: {
    asset: GenericAsset
  }
  "settings-stack": undefined
}

export type SettingsStackParams = {
  settings: undefined
  appearance: undefined
}

export type AppParams = OnboardingStackParams &
  MainStackParams &
  SettingsStackParams
