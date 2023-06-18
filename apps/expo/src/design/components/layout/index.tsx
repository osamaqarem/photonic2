import { styled } from "nativewind"
import * as React from "react"
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context"

import { View, ViewProps } from "../view"

const className = "flex-1 bg-gray-100 dark:bg-black-800"

const LayoutView: React.FC<ViewProps> = props => <View className={className} {...props} />
LayoutView.displayName = "LayoutBasic"

const LayoutSafeView: React.FC<SafeAreaViewProps> = styled(SafeAreaView, className)
LayoutSafeView.displayName = "LayoutSafe"

export const Layout = {
  View: LayoutView,
  Safe: LayoutSafeView,
}

export type LayoutType = typeof Layout
