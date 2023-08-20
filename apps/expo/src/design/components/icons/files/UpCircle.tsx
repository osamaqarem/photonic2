import * as React from "react"
import { Path } from "react-native-svg"
import type { SvgProps } from "~/design/components/Svg"
import { Svg } from "~/design/components/Svg"

export const UpCircle = (props: SvgProps) => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
    />
  </Svg>
)
