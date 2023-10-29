import type { GenericAsset } from "~/expo/features/home/types/asset"

export type OnboardingStackParams = {
  "onboarding-welcome": undefined
  "onboarding-registration": undefined
  "onboarding-code-verification": {
    email: string
  }
  "onboarding-storage": undefined
  "onboarding-permissions": undefined
}

export type MainStackParams = {
  home: undefined
  photo: {
    asset: GenericAsset
  }
}

export type RootStackParams = {
  onboarding: undefined
  main: undefined
}

export type AppParams = OnboardingStackParams &
  MainStackParams &
  RootStackParams
