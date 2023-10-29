import { createNativeStackNavigator } from "@react-navigation/native-stack"

import type { MainStackParams } from "./params"
import { HomeScreen } from "~/expo/features/home/HomeScreen"
import { PhotoScreen } from "~/expo/features/photo/PhotoScreen"

const MainStackNav = createNativeStackNavigator<MainStackParams>()

export const MainStack = () => {
  return (
    <MainStackNav.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}>
      <MainStackNav.Screen name="home" component={HomeScreen} />
      <MainStackNav.Screen
        name="photo"
        component={PhotoScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </MainStackNav.Navigator>
  )
}
