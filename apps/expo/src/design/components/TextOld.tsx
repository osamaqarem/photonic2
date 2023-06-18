import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import { styled } from "nativewind"
import * as React from "react"
import { Text as RNText, TextProps } from "react-native"

const StyledText = styled(RNText)

const build = cva("text-gray-900 dark:text-gray-100", {
  variants: {
    intent: {
      header: "font-bold",
      label: "font-medium text-gray-700 dark:text-gray-500",
      link: "font-medium text-rose-500 dark:text-rose-400",
    },
    size: {
      h1: "text-3xl tracking-tighter",
      h2: "text-2xl tracking-tight",
      body1: "text-base tracking-normal",
      subtitle1: "text-sm tracking-wider",
      subtitle2: "text-xs tracking-wider",
    },
  },
  defaultVariants: {
    intent: undefined,
    size: "body1",
  },
})

type Props = TextProps & VariantProps<typeof build>

const Text: React.FC<Props> = styled(props => {
  const { intent, size, ...rest } = props
  return (
    <StyledText
      suppressHighlighting
      {...rest}
      className={build({ intent, size })}
      onPress={props.disabled ? undefined : props.onPress}>
      {props.children}
    </StyledText>
  )
})

Text.displayName = "StyledText"

export { Text }
export type { TextProps }
