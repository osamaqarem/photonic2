import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { LoginScreen } from "src/features/onboarding/LoginScreen"
import { OnboardingPermissionsScreen } from "src/features/onboarding/OnboardingPermissionsScreen"
import { OnboardingSettingsScreen } from "src/features/onboarding/OnboardingSettingsScreen"
import { OnboardingStorageScreen } from "src/features/onboarding/OnboardingStorageScreen"
import { WelcomeScreen } from "src/features/onboarding/WelcomeScreen"
import { OnboardingStackParams } from "./params"

const OnboardingStackNav = createNativeStackNavigator<OnboardingStackParams>()

export const OnboardingStack = () => {
  return (
    <OnboardingStackNav.Navigator
      initialRouteName="welcome"
      screenOptions={{ headerShown: false }}>
      <OnboardingStackNav.Screen name="welcome" component={WelcomeScreen} />
      <OnboardingStackNav.Screen name="login" component={LoginScreen} />
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
