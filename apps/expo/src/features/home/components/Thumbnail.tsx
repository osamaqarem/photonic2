import { colors } from "platform-colors.config"
import * as React from "react"
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
import { useDragSelectContext } from "~/expo/features/home/context/drag-select-context"
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

  const isSelected = useDerivedValue(() => !!selectedItems.value[asset.name])

  const containerStyle = useContainerStyle(isSelected)

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
        // className="items-center justify-center rounded-[14px] border-2 border-dotted"
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
          //   className="h-full w-full rounded-lg bg-gray-200 dark:bg-black-600"
          downscaleSize={80}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: 10,
            backgroundColor: palette.light.slate.slate2,
          }}>
          <Animated.View
            style={overlayStyle}
            // className="absolute h-full w-full bg-black"
          />
          <Animated.View
            // className="absolute bottom-1 left-1 rounded-full bg-black/50 p-1"
            style={uploadIndicatorStyle}>
            <Icon
              name="CloudUp"
              //   className="h-4 w-4"
              style={[
                uploadIndicatorIconStyle,
                {
                  height: 16,
                  width: 16,
                },
              ]}
            />
          </Animated.View>
        </AnimatedFastImage>
        <Animated.View
          style={checkIconStyle}
          //   className="absolute bottom-[-6] right-[-6] h-6 w-6 items-center justify-center rounded-full bg-gray-100  dark:bg-black-800"
        >
          <Icon
            name="Check"
            // className="h-6 w-6 text-blue-500 dark:text-blue-400"
            style={{
              height: 16,
              width: 16,
            }}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}

Thumbnail.longPressTiming = longPressTiming

const AnimatedFastImage = Animated.createAnimatedComponent(
  FastImage as React.FC<FastImageProps>,
)

const useContainerStyle = (isSelected: Animated.SharedValue<boolean>) => {
  const { colorScheme } = useDarkMode()
  const isDarkMode = colorScheme === "dark"

  const containerStyle = useAnimatedStyle(() => {
    const [normal, selected] = isDarkMode
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
  }, [isDarkMode])

  return containerStyle
}
