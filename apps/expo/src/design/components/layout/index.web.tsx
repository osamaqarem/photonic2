import { styled } from "nativewind"

import type { LayoutType } from "."
import { View, ViewProps } from "../view"

const className = "flex-1 bg-gray-100 dark:bg-black-800 justify-center items-center"

const LayoutBasic: React.FC<ViewProps> = props => {
  return <View {...props}>{props.children}</View>
}
const LayoutBasicView = styled(LayoutBasic, className)
LayoutBasicView.displayName = "LayoutBasic"

export const Layout: LayoutType = {
  View: LayoutBasicView,
  Safe: LayoutBasicView,
}
