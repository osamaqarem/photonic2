import React from "react"

import { View } from "src/design/components/View"
import { BottomPanel } from "./Bottom"
import { BottomPanelMenu } from "./Menu"
import { SettingsBtn } from "./SettingsBtn"
import { TopPanel } from "./Top"

const Container: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <View className="absolute h-full w-full" pointerEvents="box-none">
      {children}
    </View>
  )
}

export const ControlPanel = {
  Container,
  TopPanel,
  TopPanelBtn: SettingsBtn,
  BottomPanel,
  BottomPanelMenu,
}
