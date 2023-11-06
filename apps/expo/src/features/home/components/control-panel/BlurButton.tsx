import type { BlurViewProps as ExpoBlurViewProps } from "expo-blur"
import { BlurView as ExpoBlurView } from "expo-blur"
import * as React from "react"
import type { PressableProps } from "react-native"
import { Pressable } from "react-native"
import type { AnimatedProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"

import { useDarkMode } from "~/expo/stores/DarkModeProvider"

const AnimatedExpoBlurView = Animated.createAnimatedComponent(ExpoBlurView)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const BlurView: React.FC<AnimatedProps<ExpoBlurViewProps>> = props => {
  const colorScheme = useDarkMode(s => s.colorScheme)
  return <AnimatedExpoBlurView tint={colorScheme} intensity={100} {...props} />
}

const defaultHitSlop: PressableProps["hitSlop"] = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5,
}
interface Props extends ExpoBlurViewProps {
  onPress?: PressableProps["onPress"]
}
export const BlurButton: React.FC<Props> = props => {
  const { onPress } = props
  return (
    <AnimatedPressable onPress={onPress} hitSlop={defaultHitSlop}>
      <BlurView {...props} />
    </AnimatedPressable>
  )
}
