import type { Asset } from "~/expo/lib/db/schema"

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
  settings: undefined
  photo: {
    asset: Asset
  }
}

export type RootStackParams = {
  onboarding: undefined
  main: undefined
}

export type AppParams = OnboardingStackParams &
  MainStackParams &
  RootStackParams
