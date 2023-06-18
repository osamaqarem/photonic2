import React from "react"

import { View } from "src/design/components/view"
import { BottomPanel } from "./bottom"
import { BottomPanelMenu } from "./menu"
import { SettingsBtn } from "./settings-btn"
import { TopPanel } from "./top"

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
