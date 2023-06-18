import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { View, Text } from "react-native"

import { AppParams } from "src/navigation/params"

export const WelcomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "welcome">
> = props => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>aaa</Text>
    </View>
  )
}
