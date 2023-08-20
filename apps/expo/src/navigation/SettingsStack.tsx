import { useNavigation } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { HeaderButtonProps } from "@react-navigation/native-stack/lib/typescript/src/types"
import * as React from "react"
import { TouchableOpacity } from "react-native"

import { Text } from "~/design/components/TextOld"
import { LoginScreen } from "~/features/onboarding/LoginScreen"
import { AppearanceScreen } from "~/features/settings/appearance/AppearanceScreen"
import { SettingsScreen } from "~/features/settings/SettingsScreen"
import { useDarkMode } from "~/stores/DarkModeProvider"
import type { SettingsStackParams } from "./params"

const SettingsStackNav = createNativeStackNavigator<SettingsStackParams>()

export const SettingsStack = () => {
  const { isDarkMode } = useDarkMode()

  return (
    <SettingsStackNav.Navigator
      initialRouteName="settings"
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerBlurEffect: isDarkMode
          ? "systemChromeMaterialDark"
          : "systemChromeMaterialLight",
      }}>
      <SettingsStackNav.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          presentation: "modal",
          headerRight: HeaderRightDone,
        }}
      />
      <SettingsStackNav.Screen
        name="appearance"
        component={AppearanceScreen}
        options={{
          title: "Appearance",
        }}
      />
    </SettingsStackNav.Navigator>
  )
}

const HeaderRightDone: React.FC<HeaderButtonProps> = ({ tintColor }) => {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      onPress={navigation.goBack}
      hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}>
      <Text
        className="font-semibold"
        style={{
          color: tintColor,
        }}>
        Done
      </Text>
    </TouchableOpacity>
  )
}
