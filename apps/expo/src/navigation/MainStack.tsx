import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { PhotoDetailScreen } from "src/features/photo/detail/PhotoDetailScreen"
import { PhotoListScreen } from "src/features/photo/list/PhotoListScreen"
import { MainStackParams } from "./params"
import { SettingsStack } from "./SettingsStack"

const MainStackNav = createNativeStackNavigator<MainStackParams>()

export const MainStack = () => {
  return (
    <MainStackNav.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="home">
      <MainStackNav.Screen name="home" component={PhotoListScreen} />
      <MainStackNav.Screen
        name="photo"
        component={PhotoDetailScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <MainStackNav.Screen
        name="settings-stack"
        component={SettingsStack}
        options={{ presentation: "modal" }}
      />
    </MainStackNav.Navigator>
  )
}
