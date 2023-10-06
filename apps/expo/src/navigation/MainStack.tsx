import { createNativeStackNavigator } from "@react-navigation/native-stack"

import type { MainStackParams } from "./params"
import { HomeScreen } from "~/expo/features/home/HomeScreen"

const MainStackNav = createNativeStackNavigator<MainStackParams>()

export const MainStack = () => {
  return (
    <MainStackNav.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}>
      <MainStackNav.Screen name="home" component={HomeScreen} />
    </MainStackNav.Navigator>
  )
}
