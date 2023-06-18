import * as React from "react"
import { Path } from "react-native-svg"
import { Svg, SvgProps } from "src/design/components/Svg"

export const Moon = (props: SvgProps) => (
  <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <Path
      fillRule="evenodd"
      d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083z"
      clipRule="evenodd"
    />
  </Svg>
)
