import * as React from "react"
import { StyleSheet } from "react-native"
import type { FastImageProps } from "react-native-fast-image"
import FastImage from "react-native-fast-image"
import {
  Gesture,
  GestureDetector,
  type PanGesture,
} from "react-native-gesture-handler"
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated"

import { Icon } from "~/expo/design/components/icons/Icons"
import { palette } from "~/expo/design/palette"
import { theme } from "~/expo/design/theme"
import { useDragSelectContext } from "~/expo/features/home/context/DragSelectContextProvider"
import type { GenericAsset } from "~/expo/features/home/types/asset"
import { useDarkMode } from "~/expo/stores/DarkModeProvider"

const longPressTiming = 300
const scaleTiming = 300

interface Props {
  asset: GenericAsset
  onPress: (item: GenericAsset) => void
  tapOnStart: () => void
  longPressOnStart: () => void
  simultaneousWithExternalGesture: PanGesture
  height: number
  width: number
}

export const Thumbnail: React.FC<Props> & {
  longPressTiming: number
} = props => {
  const { asset } = props

  const uri = asset.type === "RemoteAsset" ? asset.url : asset.localUri

  const { assetRecord, selectedItems } = useDragSelectContext()

  const sharedColorScheme = useDarkMode(s => s.sharedColorScheme)

  const isSelected = useDerivedValue(() => !!selectedItems.value[asset.name])

  const containerStyle = useAnimatedStyle(() => {
    const [normal, selected] =
      sharedColorScheme.value === "dark"
        ? [palette.black.blackA12, palette.dark.blue.blue6]
        : [palette.white.whiteA12, palette.light.blue.blue5]
    return {
      borderColor: isSelected.value ? selected : normal,
      padding: withTiming(isSelected.value ? 4 : 0, {
        duration: scaleTiming,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      }),
      transform: [
        {
          scale: withTiming(isSelected.value ? 0.9 : 1, {
            duration: scaleTiming,
            easing: Easing.bezier(0.33, 1, 0.68, 1),
          }),
        },
      ],
    }
  })

  const checkIconStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected.value ? 1 : 0, {
      duration: scaleTiming - 100,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected.value ? 0.3 : 0, {
      duration: scaleTiming,
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }),
  }))

  const uploadIndicatorStyle = useAnimatedStyle(() => {
    const type = assetRecord.value[asset.name]?.type
    const localOrRemote = type === "LocalAsset" || type === "RemoteAsset"
    return { opacity: localOrRemote ? 1 : 0 }
  })

  const uploadIndicatorIconStyle = useAnimatedStyle(() => {
    const type = assetRecord.value[asset.name]?.type
    return {
      color:
        type === "LocalAsset"
          ? palette.light.slate.slate3
          : palette.light.blue.blue3,
    }
  })

  const tapGesture = Gesture.Tap()
    .maxDuration(longPressTiming)
    .onStart(props.tapOnStart)

  const longPressGesture = Gesture.LongPress()
    .minDuration(longPressTiming)
    .onStart(props.longPressOnStart)
    .simultaneousWithExternalGesture(props.simultaneousWithExternalGesture)

  const composed = Gesture.Simultaneous(tapGesture, longPressGesture)

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        // R2 = R1 + D
        style={[
          containerStyle,
          {
            height: props.height,
            width: props.width,
          },
        ]}>
        <AnimatedFastImage
          resizeMode="cover"
          source={{ uri }}
          // R1
          downscaleSize={80}
          style={styles.image}>
          <Animated.View style={[overlayStyle, styles.overlay]} />
          <Animated.View
            style={[uploadIndicatorStyle, styles.cloudIconContainer]}>
            <Icon
              name="CloudUp"
              style={[uploadIndicatorIconStyle, styles.cloudIcon]}
            />
          </Animated.View>
        </AnimatedFastImage>
        <Animated.View style={[checkIconStyle, styles.checkIconContainer]}>
          <Icon name="Check" style={styles.checkIcon} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}

Thumbnail.longPressTiming = longPressTiming

const AnimatedFastImage = Animated.createAnimatedComponent(
  FastImage as React.FC<FastImageProps>,
)

const styles = StyleSheet.create({
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 8,
    backgroundColor: palette.light.slate.slate2,
  },
  overlay: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: palette.black.blackA12,
  },
  cloudIconContainer: {
    position: "absolute",
    bottom: 4,
    left: 4,
    borderRadius: 100,
    backgroundColor: palette.black.blackA9,
    padding: 4,
  },
  cloudIcon: {
    height: 16,
    width: 16,
  },
  checkIconContainer: {
    position: "absolute",
    bottom: -6,
    right: -6,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: theme.colors.background,
  },
  checkIcon: {
    color: palette.light.blue.blue8,
  },
})
