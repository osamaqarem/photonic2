import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { Text, View } from "react-native"
import { StyleSheet } from "react-native"

import type { AppParams } from "~/expo/navigation/params"

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Test</Text>
    </View>
  )
}

const styles = StyleSheet.create({})
