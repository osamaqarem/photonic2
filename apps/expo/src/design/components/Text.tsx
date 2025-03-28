import * as React from "react"
import type { TextProps, TextStyle } from "react-native"
import { Text as RNText } from "react-native"

import { font } from "~/expo/design/theme"

export const variants = {
  h1: font().weight("bold").color("text").size("xl").style,
  h2: font().weight("semibold").color("text").size("l").style,
  h3: font().weight("medium").color("text").size("m").style,
  p: font().weight("regular").color("text").size("s").style,
  span: font().weight("medium").color("textLowContrast").size("xs").style,
} satisfies Record<string, TextStyle>

interface Props extends TextProps {
  variant?: keyof typeof variants
}

export const Text: React.FC<Props> = ({ variant = "p", ...props }) => {
  return (
    <RNText {...props} style={[variants[variant], props.style]}>
      {props.children}
    </RNText>
  )
}
