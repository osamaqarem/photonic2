import * as React from "react"
import { View } from "react-native"
import { theme } from "~/design/theme"

type Spacing = keyof (typeof theme)["space"]["scale"]

type Props = {
  pad?: boolean
  v?: Spacing
  h?: Spacing
  t?: Spacing
  b?: Spacing
  l?: Spacing
  r?: Spacing
}

export const Space: React.FC<React.PropsWithChildren<Props>> = React.memo(
  props => {
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
  },
)
