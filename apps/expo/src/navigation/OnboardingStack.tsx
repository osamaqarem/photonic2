import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { OnboardingCodeVerification } from "~/expo/features/onboarding/OnboardingCodeVerification"
import { OnboardingPermissionsScreen } from "~/expo/features/onboarding/OnboardingPermissionsScreen"
import { OnboardingRegistrationScreen } from "~/expo/features/onboarding/OnboardingRegistration"
import { OnboardingSettingsScreen } from "~/expo/features/onboarding/OnboardingSettingsScreen"
import { OnboardingStorageScreen } from "~/expo/features/onboarding/OnboardingStorageScreen"
import { OnboardingWelcomeScreen } from "~/expo/features/onboarding/OnboardingWelcomeScreen"
import type { OnboardingStackParams } from "./params"

const OnboardingStackNav = createNativeStackNavigator<OnboardingStackParams>()

export const OnboardingStack = () => {
  return (
    <OnboardingStackNav.Navigator
      initialRouteName="onboarding-welcome"
      screenOptions={{ headerShown: false }}>
      <OnboardingStackNav.Screen
        name="onboarding-welcome"
        component={OnboardingWelcomeScreen}
      />
      <OnboardingStackNav.Screen
        name="onboarding-registration"
        component={OnboardingRegistrationScreen}
      />
      <OnboardingStackNav.Screen
        name="onboarding-code-verification"
        component={OnboardingCodeVerification}
      />
      <OnboardingStackNav.Screen
        name="onboarding-storage"
        component={OnboardingStorageScreen}
      />
      <OnboardingStackNav.Screen
        name="onboarding-permissions"
        component={OnboardingPermissionsScreen}
      />
      <OnboardingStackNav.Screen
        name="onboarding-settings"
        component={OnboardingSettingsScreen}
      />
    </OnboardingStackNav.Navigator>
  )
}
