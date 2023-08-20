import { LinearGradient } from "expo-linear-gradient"
import * as React from "react"
import type { ViewProps } from "react-native"
import { View } from "react-native"
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BlurButton } from "~/design/components/Blur"
import { Icon } from "~/design/components/icons/Icons"
import { useSharedValueContext } from "~/features/photo/list/context/SharedValueContext"
import { ReText } from "./Retext"

const deselectBtnHeight = 48

interface Props {
  clearSelection: () => void
}

export const TopPanel: React.FC<React.PropsWithChildren<Props>> = props => {
  const { clearSelection, children } = props

  const { selectModeActive, selectedItemsCountText, showGradientOverlay } =
    useSharedValueContext()

  const { top: topInset } = useSafeAreaInsets()

  const animatedProps = useAnimatedProps<{
    pointerEvents: ViewProps["pointerEvents"]
  }>(() => ({
    pointerEvents: selectModeActive.value ? "auto" : "none",
  }))

  const deselectBtnStyle = useAnimatedStyle(() => ({
    opacity: selectModeActive.value
      ? withTiming(1, {
          duration: 200,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })
      : 0,
  }))

  const gradientOverlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showGradientOverlay.value ? 1 : 0, {
      duration: 200,
      easing: Easing.linear,
    }),
  }))

  return (
    <View className="flex-1" pointerEvents="box-none">
      <AnimiatedLinearGradient
        pointerEvents="none"
        className="absolute h-28 w-full"
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
        style={gradientOverlayStyle}
      />
      <View
        className="flex-row items-center justify-between"
        style={{
          marginTop: topInset,
        }}
        pointerEvents="box-none">
        <Animated.View
          animatedProps={animatedProps}
          style={deselectBtnStyle}
          className="ml-5">
          <BlurButton
            className="h-full flex-row items-center justify-between rounded-full px-5"
            style={{ height: deselectBtnHeight }}
            onPress={clearSelection}>
            <Icon
              name="Xmark"
              className="h-5 w-5 text-gray-900 dark:text-gray-100"
            />
            <View className="w-3" />
            <View className="min-w-[20] justify-center" pointerEvents="none">
              <ReText
                className="bottom-[5] text-base font-medium text-gray-900 dark:text-gray-100"
                text={selectedItemsCountText}
              />
            </View>
          </BlurButton>
        </Animated.View>
        <View className="mr-5 items-center justify-center">{children}</View>
      </View>
    </View>
  )
}

const AnimiatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
