import * as React from "react"
import type { StyleProp, TouchableOpacityProps, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native"

import { Text } from "~/design/components/Text"

interface Props extends React.ComponentProps<typeof Text> {
  btnStyle?: StyleProp<ViewStyle>
}
export const TextButton: React.FC<Props> = ({
  btnStyle,
  onPress,
  ...textProps
}) => {
  return (
    <TouchableOpacity {...btnConfig} onPress={onPress} style={btnStyle}>
      <Text {...textProps}>{textProps.children}</Text>
    </TouchableOpacity>
  )
}

const btnConfig: TouchableOpacityProps = {
  activeOpacity: 0.7,
  hitSlop: {
    top: 10,
    bottom: 10,
    right: 10,
    left: 10,
  },
}
