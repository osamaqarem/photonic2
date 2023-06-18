import { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"

import { Layout } from "src/design/components/layout"
import { Text } from "src/design/components/text"
import { View } from "src/design/components/view"
import { AppParams } from "src/navigation/native/params"
import { useDarkMode } from "src/providers/dark-mode/use-dark-mode"

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
