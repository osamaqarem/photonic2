import { styled } from "nativewind"
import { Pressable as RNPressable, PressableProps } from "react-native"

const Pressable = styled(RNPressable)
Pressable.displayName = "Pressable"

export type { PressableProps }
export { Pressable }
