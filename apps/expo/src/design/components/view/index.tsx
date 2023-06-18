import { styled } from "nativewind"
import * as React from "react"
import { View as RNView, ViewProps } from "react-native"

const View: React.FC<React.PropsWithChildren<ViewProps>> = styled(RNView)

View.displayName = "View"

export type { ViewProps }
export { View }
