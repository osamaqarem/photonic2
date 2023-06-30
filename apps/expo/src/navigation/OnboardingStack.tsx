import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { OnboardingPermissionsScreen } from "src/features/onboarding/OnboardingPermissionsScreen"
import { OnboardingRegistrationScreen } from "src/features/onboarding/OnboardingRegistration"
import { OnboardingSettingsScreen } from "src/features/onboarding/OnboardingSettingsScreen"
import { OnboardingStorageScreen } from "src/features/onboarding/OnboardingStorageScreen"
import { OnboardingWelcomeScreen } from "src/features/onboarding/OnboardingWelcomeScreen"
import { OnboardingStackParams } from "./params"

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
