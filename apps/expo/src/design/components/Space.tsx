import * as React from "react"
import { View } from "react-native"
import { theme } from "src/design/theme"

type Props = {
  pad?: boolean
  v?: number
  h?: number
  t?: number
  b?: number
  l?: number
  r?: number
}

export const Space: React.FC<React.PropsWithChildren<Props>> = props => {
  return (
    <View
      style={{
        marginHorizontal: props.pad ? theme.space.contentPadding : props.h,
        marginVertical: props.pad ? theme.space.contentPadding : props.v,
        marginTop: props.t,
        marginBottom: props.b,
        marginStart: props.l,
        marginEnd: props.r,
      }}>
      {props.children}
    </View>
  )
}
