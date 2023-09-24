import React from "react"
import type { AnimatedProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import type { SvgProps as RNSvgProps } from "react-native-svg"
import RNSvg from "react-native-svg"

type RNSvgPropsStyle = Pick<RNSvgProps, "style">

type PatchedSvgProps = RNSvgProps & {
  style?: RNSvgPropsStyle & { color?: string } // manual patch to support 'color' style
}

type AnimatedSvgProps = AnimatedProps<PatchedSvgProps>

const AnimatedSvg = Animated.createAnimatedComponent(
  RNSvg,
) as React.ComponentClass<AnimatedSvgProps, any>

export const Svg = (props: AnimatedSvgProps) => <AnimatedSvg {...props} />
