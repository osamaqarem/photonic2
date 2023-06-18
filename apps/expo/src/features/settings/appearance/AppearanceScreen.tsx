import { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"

import { Layout } from "src/design/components/Layout"
import { Text } from "src/design/components/TextOld"
import { View } from "react-native"
import { AppParams } from "src/navigation/params"
import { useDarkMode } from "src/stores/dark-mode/useDarkMode"

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
