/**
 * Forked from react-native-redash
 * https://github.com/wcandillon/react-native-redash/blob/d33868975471c3d3f3d6ecc3b4247e89933a95e9/src/ReText.tsx
 */
import React from "react"
import type { TextInputProps, TextProps as RNTextProps } from "react-native"
import { StyleSheet, TextInput } from "react-native"
import type { SharedValue, AnimatedProps } from "react-native-reanimated"
import Animated, { useAnimatedProps } from "react-native-reanimated"

const styles = StyleSheet.create({
  baseStyle: {
    color: "black",
  },
})
Animated.addWhitelistedNativeProps({ text: true })

interface TextProps extends Omit<TextInputProps, "value" | "style"> {
  text: SharedValue<string>
  style?: AnimatedProps<RNTextProps>["style"]
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const ReText = (props: TextProps) => {
  const { style, text, ...rest } = props
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value,
      // Here we use any because the text prop is not available in the type
    } as any
  })
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={text.value}
      style={[styles.baseStyle, style || undefined]}
      {...rest}
      {...{ animatedProps }}
    />
  )
}
