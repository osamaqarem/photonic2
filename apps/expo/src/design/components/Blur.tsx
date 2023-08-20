import type {
  BlurViewProps as ExpoBlurViewProps} from "expo-blur";
import {
  BlurView as ExpoBlurView
} from "expo-blur"
import { styled } from "nativewind"
import * as React from "react"
import type { PressableProps } from "react-native";
import { Pressable } from "react-native"
import Animated from "react-native-reanimated"

import { useDarkMode } from "~/stores/DarkModeProvider"

const AnimatedExpoBlurView = Animated.createAnimatedComponent(ExpoBlurView)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const BlurView = styled<Animated.AnimateProps<ExpoBlurViewProps>>(
  props => {
    const { colorScheme } = useDarkMode()
    return (
      <AnimatedExpoBlurView tint={colorScheme} intensity={100} {...props} />
    )
  },
)
BlurView.displayName = "BlurView"

const defaultHitSlop: PressableProps["hitSlop"] = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5,
}
interface Props extends ExpoBlurViewProps {
  onPress?: PressableProps["onPress"]
}
export const BlurButton = styled<Props>(props => {
  const { onPress } = props
  return (
    <AnimatedPressable onPress={onPress} hitSlop={defaultHitSlop}>
      <BlurView {...props} />
    </AnimatedPressable>
  )
}, "overflow-hidden")

BlurButton.displayName = "BlurButton"
