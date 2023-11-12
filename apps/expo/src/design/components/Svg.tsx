import React from "react"
import type { OpaqueColorValue } from "react-native"
import type { AnimatedProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import type { SvgProps as RNSvgProps } from "react-native-svg"
import RNSvg from "react-native-svg"

type RNSvgPropsStyle = Pick<RNSvgProps, "style">

type PatchedSvgProps = RNSvgProps & {
  style?: RNSvgPropsStyle & { color?: string | OpaqueColorValue } // manual patch to support 'color' style
}

export type SvgProps = AnimatedProps<PatchedSvgProps>

const AnimatedSvg = Animated.createAnimatedComponent(
  RNSvg,
) as React.ComponentClass<SvgProps, any>

export const Svg = (props: SvgProps) => <AnimatedSvg {...props} />
