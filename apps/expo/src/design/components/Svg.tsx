import React from "react"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import type { SvgProps as RNSvgProps } from "react-native-svg"
import RNSvg from "react-native-svg"

type RNSvgPropsStyle = Pick<RNSvgProps, "style">

type PatchedSvgProps = RNSvgProps & {
  style?: RNSvgPropsStyle & { color?: string } // manual patch to support 'color' style
}

export type SvgProps = AnimateProps<PatchedSvgProps>

const AnimatedSvg = Animated.createAnimatedComponent(
  RNSvg,
) as React.ComponentClass<SvgProps, any>

export const Svg = (props: SvgProps) => <AnimatedSvg {...props} />
