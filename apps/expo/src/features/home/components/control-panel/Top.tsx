import { LinearGradient } from "expo-linear-gradient"
import * as React from "react"
import type { ViewProps } from "react-native"
import { StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "~/expo/design/components/icons/Icons"
import { font, theme } from "~/expo/design/theme"
import { ReText } from "~/expo/features/home/components/control-panel/ReText"
import { useDragSelectContext } from "~/expo/state/DragSelectContextProvider"
import { BlurPressable } from "./BlurPressable"

const deselectBtnHeight = 48

interface Props {
  clearSelection: () => void
}

export const TopPanel: React.FC<React.PropsWithChildren<Props>> = props => {
  const { clearSelection, children } = props

  const { selectModeActive, selectedItemsCountText, showGradientOverlay } =
    useDragSelectContext()

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
    <View style={styles.root} pointerEvents="box-none">
      <AnimiatedLinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
        style={[styles.gradient, gradientOverlayStyle]}
      />
      <View
        style={[
          styles.boxNone,
          {
            marginTop: topInset,
          },
        ]}
        pointerEvents="box-none">
        <Animated.View
          animatedProps={animatedProps}
          style={[styles.deselectBtn, deselectBtnStyle]}>
          <BlurPressable style={styles.blurBtn} onPress={clearSelection}>
            <Icon name="Xmark" style={styles.xMark} />
            <View style={styles.space} />
            <View pointerEvents="none" style={styles.textContainer}>
              <ReText style={styles.text} text={selectedItemsCountText} />
            </View>
          </BlurPressable>
        </Animated.View>
        <View style={styles.container}>{children}</View>
      </View>
    </View>
  )
}

const AnimiatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    height: 112,
    width: "100%",
  },
  boxNone: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deselectBtn: {
    marginLeft: 20,
  },
  blurBtn: {
    height: deselectBtnHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 100,
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  xMark: {
    height: 20,
    width: 20,
    color: theme.colors.text,
  },
  space: {
    width: 12,
  },
  textContainer: {
    minWidth: 20,
    justifyContent: "center",
  },
  text: {
    height: 20,
    ...font().weight("medium").color("text").size("s").style,
  },
  container: {
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})
