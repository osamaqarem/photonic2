import * as React from "react"
import { Path } from "react-native-svg"
import type { SvgProps } from "~/expo/design/components/Svg"
import { Svg } from "~/expo/design/components/Svg"

export const Xmark = (props: SvgProps) => (
  <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <Path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
  </Svg>
)
