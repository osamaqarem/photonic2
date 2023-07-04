import { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"

import { Layout } from "~/design/components/Layout"
import { Text } from "~/design/components/TextOld"
import { View } from "react-native"
import { AppParams } from "~/navigation/params"
import { useDarkMode } from "~/stores/DarkModeProvider"

export const AppearanceScreen: React.FC<
  NativeStackScreenProps<AppParams, "appearance">
> = () => {
  const { setDark, setLight, setSystem } = useDarkMode()

  return (
    <Layout.Safe>
      <View className="mt-10" />
      <Text onPress={setLight}>light</Text>
      <View className="mt-10" />
      <Text onPress={setDark}>dark</Text>
      <View className="mt-10" />
      <Text onPress={setSystem}>system</Text>
    </Layout.Safe>
  )
}
