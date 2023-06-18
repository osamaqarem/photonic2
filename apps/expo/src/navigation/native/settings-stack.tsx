import { useNavigation } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { HeaderButtonProps } from "@react-navigation/native-stack/lib/typescript/src/types"
import * as React from "react"
import { TouchableOpacity } from "react-native"

import { Text } from "src/design/components/text"
import { LoginScreen } from "src/features/login/login-screen"
import { AppearanceScreen } from "src/features/settings/appearance/appearance-screen"
import { SettingsScreen } from "src/features/settings/settings-screen"
import { useDarkMode } from "src/providers/dark-mode/use-dark-mode"
import { SettingsStackParams } from "./params"

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
        name="login"
        component={LoginScreen}
        options={{ title: "Login" }}
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
