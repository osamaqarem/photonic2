import * as React from "react"
import { Path } from "react-native-svg"
import type { SvgProps } from "~/expo/design/components/Svg"
import { Svg } from "~/expo/design/components/Svg"

export const ChevronRight = (props: SvgProps) => {
  return (
    <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <Path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02z"
        clipRule="evenodd"
      />
    </Svg>
  )
}
