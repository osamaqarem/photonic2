import * as React from "react"
import { Path } from "react-native-svg"
import { Svg, SvgProps } from "~/design/components/Svg"

export const Cloud = (props: SvgProps) => (
  <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <Path d="M1 12.5A4.5 4.5 0 0 0 5.5 17H15a4 4 0 0 0 1.866-7.539 3.504 3.504 0 0 0-4.504-4.272A4.5 4.5 0 0 0 4.06 8.235 4.502 4.502 0 0 0 1 12.5z" />
  </Svg>
)
