import type { BlurViewProps as ExpoBlurViewProps } from "expo-blur"
import { BlurView as ExpoBlurView } from "expo-blur"
import * as React from "react"
import type { PressableProps } from "react-native"
import { Pressable } from "react-native"
import type { AnimatedProps } from "react-native-reanimated"
import Animated, { useAnimatedProps } from "react-native-reanimated"

import { useDarkMode } from "~/expo/stores/DarkModeProvider"

const AnimatedExpoBlurView = Animated.createAnimatedComponent(ExpoBlurView)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const BlurView: React.FC<AnimatedProps<ExpoBlurViewProps>> = props => {
  const sharedColorScheme = useDarkMode(s => s.sharedColorScheme)

  const animatedProps = useAnimatedProps(() => ({
    tint: sharedColorScheme.value,
  }))

  return (
    <AnimatedExpoBlurView
      intensity={100}
      {...props}
      animatedProps={{ ...props.animatedProps, ...animatedProps }}
    />
  )
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
export const BlurPressable: React.FC<Props> = props => {
  const { onPress } = props
  return (
    <AnimatedPressable onPress={onPress} hitSlop={defaultHitSlop}>
      <BlurView {...props} />
    </AnimatedPressable>
  )
}
