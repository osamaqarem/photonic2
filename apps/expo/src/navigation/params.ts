export type OnboardingStackParams = {
  "onboarding-welcome": undefined
  "onboarding-registration": undefined
  "onboarding-code-verification": {
    email: string
  }
  "onboarding-storage": undefined
  "onboarding-permissions": undefined
  "onboarding-settings": undefined
}

export type AppParams = OnboardingStackParams
