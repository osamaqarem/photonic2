import React from "react"
import { View, StyleSheet } from "react-native"

import { BottomPanel } from "./Bottom"
import { BottomPanelMenu } from "./Menu"
import { SettingsBtn } from "./SettingsBtn"
import { TopPanel } from "./Top"

const Container: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
})

export const ControlPanel = {
  Container,
  TopPanel,
  TopPanelBtn: SettingsBtn,
  BottomPanel,
  BottomPanelMenu,
}
