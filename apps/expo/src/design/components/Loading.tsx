import React from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { View, ActivityIndicator, StyleSheet } from "react-native"

interface Props {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export const Loading = ({ children, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={"large"} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
