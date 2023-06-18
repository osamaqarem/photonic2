import { styled, StyledProps } from "nativewind"
import React from "react"
import Animated from "react-native-reanimated"
import RNSvg, { SvgProps as RNSvgProps } from "react-native-svg"

type RNSvgPropsStyle = Pick<RNSvgProps, "style">

type PatchedSvgProps = RNSvgProps & {
  style?: RNSvgPropsStyle & { color?: string } // manual patch to support 'color' style
}

type AnimatedSvgProps = Animated.AnimateProps<PatchedSvgProps>

const AnimatedSvg = Animated.createAnimatedComponent(RNSvg) as React.ComponentClass<
  AnimatedSvgProps,
  any
>

export type SvgProps = StyledProps<AnimatedSvgProps>

export const Svg = styled((props: AnimatedSvgProps) => <AnimatedSvg {...props} />)
