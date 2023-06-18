import * as React from "react"
import { Path } from "react-native-svg"
import { Svg, SvgProps } from "../svg"

export const ArrowUpSquare = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
    />
  </Svg>
)
