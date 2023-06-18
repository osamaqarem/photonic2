import * as React from "react"
import { Path } from "react-native-svg"
import { Svg, SvgProps } from "src/design/components/Svg"

export const Ellipsis = (props: SvgProps) => (
  <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <Path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm5.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm7-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </Svg>
)
