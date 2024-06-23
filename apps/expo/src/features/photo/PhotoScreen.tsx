import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"
import { StatusBar, StyleSheet, useWindowDimensions } from "react-native"
import type { OnLoadEvent } from "react-native-fast-image"
import FastImage from "react-native-fast-image"
import type {
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
  TapGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import {
  PanGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler"
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { useAssetUri } from "~/expo/hooks/useAssetUri"
import { clamp, interpolateValue } from "~/expo/lib/math"
import * as vec from "~/expo/lib/vectors"
import type { AppParams } from "~/expo/navigation/params"

// TODO: viewpager to swipe between images
// use transparent nav bar
// zoom out after zoom in continuious gesture should zoom out to original place
// try image transform state reset animations for goBack in SET.
// vibration at max/min scale

// Prevent the user from dismissing the modal if they zoom in then zoom out too much by accident - OK
// scale down to go back - OK
// pan down from base_scale to go back - OK
// refactor into vectors - OK
// double tap to zoom at point - ok
// double tap to zoom out if zoomed in - OK
// fix slow zoom - OK
// handle focal zoom point - OK
// handle device aspect ratio - OK
// handle device orientation - OK

const BASE_SCALE = 1
const MIN_SCALE = 0
const MAX_SCALE = 4
const MIN_IMG_SCALE = 0.3

const MAX_OPACITY = 1
const MIN_OPACITY = 0
const DISMISS_OPACITY = 0.7

const BASE_TRANSLATION = 0

export const PhotoScreen: React.FC<
  NativeStackScreenProps<AppParams, "photo">
> = props => {
  const { asset } = props.route.params

  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  const hasRawData = asset.type === "localRemote" || asset.type === "local"
  const [image, setImageSize] = React.useState({
    width: hasRawData ? asset.width : 0,
    height: hasRawData ? asset.height : 0,
  })

  const uri = useAssetUri(asset)

  const aspectWidth = screenWidth ?? 0
  const aspectHeight = React.useMemo(() => {
    if (!image.width || !image.height) return 0

    return Math.min(
      screenHeight - (StatusBar.currentHeight ?? 0),
      (screenWidth * image.height) / image.width,
    )
  }, [image.height, image.width, screenHeight, screenWidth])

  const imageRef = useAnimatedRef()

  const scale = useSharedValue(1)
  const initialScale = useSharedValue(BASE_SCALE)
  const scaleOffset = useSharedValue(0)
  const initialScaleEvent = useSharedValue<"up" | "down" | undefined>(undefined)

  const translation = vec.useVector(0)
  const translationOffset = vec.useVector(0)

  const backgroundColorOpacity = useSharedValue(MAX_OPACITY)

  function onImageLoaded(e: OnLoadEvent) {
    console.log(e.nativeEvent)
    setImageSize(e.nativeEvent)
  }

  function getCurrentImgViewWidth() {
    "worklet"
    const imgWidthWide = aspectWidth
    const imgWidthThin = (aspectHeight * image.width) / image.height
    return Math.min(imgWidthWide, imgWidthThin) * scale.value
  }

  function getCurrentImgViewHeight() {
    "worklet"
    return aspectHeight * scale.value
  }

  function resetScale() {
    "worklet"
    scale.value = withTiming(BASE_SCALE, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    })
    scaleOffset.value = 0
  }

  function resetOpacity() {
    "worklet"
    backgroundColorOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    })
  }

  function resetPanXY() {
    "worklet"
    translation.x.value = withTiming(BASE_TRANSLATION, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    })
    translation.y.value = withTiming(BASE_TRANSLATION, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    })
    vec.set(translationOffset, BASE_TRANSLATION)
  }

  const goBack = props.navigation.goBack

  function handleDismissBasedOnOpacity() {
    "worklet"
    if (backgroundColorOpacity.value <= DISMISS_OPACITY) {
      backgroundColorOpacity.value = withTiming(MIN_OPACITY, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      })

      scale.value = withTiming(
        // Running this animation before goBack() is a workaround for a bug with shared element transition on Android
        // The bug causes the thumbnail in Gallery.tsx to blink when the SET starts.
        scale.value + 0.01,
        {
          duration: 0,
          easing: Easing.linear,
        },
        // do not use a refactor this callback to withTiming into a single callback.
        // it will crash.
        () => {
          runOnJS(goBack)()
        },
      )
      return true
    }
  }

  const pinchHandler = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    EmptyObject
  >({
    onStart: () => {
      // Prevent the user from dismissing the photo if they zoom in then zoom out too much by accident.
      const fromBaseScale = scale.value === BASE_SCALE
      initialScaleEvent.value =
        initialScaleEvent.value ?? fromBaseScale ? "down" : "up"
    },
    onActive: e => {
      const prevScaleValue = scale.value

      function displacementForOriginCorrection() {
        const transformOriginX = screenWidth / 2
        const transformOriginY = screenHeight / 2

        const imgWidth = getCurrentImgViewWidth()
        const imgHeight = getCurrentImgViewHeight()

        const leftEdge = (imgWidth - screenWidth) / scale.value / 2
        const rightEdge = -leftEdge
        const topEdge = (imgHeight - screenHeight) / scale.value / 2
        const bottomEdge = -topEdge

        const scaleDiff = Math.abs(scale.value - prevScaleValue)

        const displacementX =
          ((transformOriginX - e.focalX) / prevScaleValue) * scaleDiff +
          translationOffset.x.value
        const displacementY =
          ((transformOriginY - e.focalY) / prevScaleValue) * scaleDiff +
          translationOffset.y.value

        if (imgWidth > screenWidth && scale.value <= MAX_SCALE) {
          translation.x.value = clamp(displacementX, rightEdge, leftEdge)
        }
        if (imgHeight > screenHeight && scale.value <= MAX_SCALE) {
          translation.y.value = clamp(displacementY, bottomEdge, topEdge)
        }
      }

      /**
       * @description
       * Problem: when zooming in the scale factor goes from 1 to MAX_SCALE.
       * However, when zooming out it goes only from 1 to 0. This makes zooming out very slow.
       * Solution: we can rescale the scale factor values so instead of going from 1 to 0,
       * it goes from 1 to -5.
       * e.g. Input range: [1, 0]. Output range: [1, -3]
       * @returns normalized scale, a value between NEW_MAX and NEW_MIN.
       */
      function handleAcceleratedScaleDown() {
        const [oldMin, oldMax] = [MIN_SCALE, BASE_SCALE]
        const [newMin, newMax] = [-3, BASE_SCALE]

        const normalizedScale = interpolateValue(
          e.scale,
          oldMin,
          oldMax,
          newMin,
          newMax,
        )

        // TODO: reverse displacement x,y
        scale.value = Math.max(
          scaleOffset.value + normalizedScale,
          MIN_IMG_SCALE,
        )
      }

      function handleScaleDownToDismissOpacity() {
        const [inMin, inMax] = [MIN_IMG_SCALE, BASE_SCALE]
        const [outMin, outMax] = [MIN_SCALE, MAX_OPACITY]

        backgroundColorOpacity.value = interpolateValue(
          scale.value,
          inMin,
          inMax,
          outMin,
          outMax,
        )
      }

      if (e.scale >= BASE_SCALE) {
        // Zooming in
        scale.value = scaleOffset.value + e.scale
      } else if (initialScaleEvent.value === "down") {
        // Zooming out and dismissing
        scale.value = scaleOffset.value + e.scale
        handleScaleDownToDismissOpacity()
      } else {
        // Zooming out after being zoomed in (accelerated)
        handleAcceleratedScaleDown()
      }

      displacementForOriginCorrection()
      vec.set(translationOffset, translation)
    },
    onFinish: () => {
      // console.log('pinch onFinish')

      initialScaleEvent.value = undefined

      const shouldDismiss = handleDismissBasedOnOpacity()
      if (shouldDismiss) {
        return
      }

      resetOpacity()

      if (scale.value < BASE_SCALE) {
        resetScale()
        resetPanXY()
      } else if (scale.value > MAX_SCALE) {
        // subtract BASE_SCALE because identity scale is 1 and not 0:
        scaleOffset.value = MAX_SCALE - BASE_SCALE
        scale.value = withTiming(MAX_SCALE, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        })
      } else {
        scaleOffset.value = scale.value - BASE_SCALE
      }
    },
  })

  const panHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    EmptyObject
  >({
    onActive: e => {
      // console.log('pan onActive')

      if (scale.value > BASE_SCALE) {
        const imgWidth = getCurrentImgViewWidth() // actual image width for when the image is taller than it is wide
        const imgHeight = getCurrentImgViewHeight()

        function handlePanX() {
          // note: even if the scale increases, e.translateX remains with respect to the original unscaled image.
          const leftEdge = (imgWidth - screenWidth) / scale.value / 2
          const rightEdge = -leftEdge
          translation.x.value = clamp(
            translationOffset.x.value + e.translationX,
            rightEdge,
            leftEdge,
          )
        }
        function handlePanY() {
          const topEdge = (imgHeight - screenHeight) / scale.value / 2
          const bottomEdge = -topEdge
          translation.y.value = clamp(
            translationOffset.y.value + e.translationY,
            bottomEdge,
            topEdge,
          )
        }

        if (imgWidth > screenWidth && scale.value <= MAX_SCALE) {
          handlePanX()
        }
        if (imgHeight > screenHeight && scale.value <= MAX_SCALE) {
          handlePanY()
        }
      } else {
        function handlePanToDismissScale() {
          translation.y.value = translationOffset.y.value + e.translationY
          translation.x.value = translationOffset.x.value + e.translationX

          const absTranslationY = Math.abs(e.translationY)

          const maxTranslationYDistance = screenHeight * 0.2
          const scaleAtMaxTranslationY = BASE_SCALE * 0.9
          const [startTranslationY, endTranslationY] = [
            0,
            maxTranslationYDistance,
          ]
          const [startOpacity, endOpacity] = [MAX_OPACITY, 0.7]

          backgroundColorOpacity.value = interpolateValue(
            absTranslationY,
            startTranslationY,
            endTranslationY,
            startOpacity,
            endOpacity,
          )

          if (absTranslationY <= maxTranslationYDistance) {
            // Calculate (interpolate) a scale value and an opacity value based on a translationY value.
            // e.translationY = 0 is no translation
            const [startScale, endScale] = [BASE_SCALE, scaleAtMaxTranslationY]

            scale.value = interpolateValue(
              absTranslationY,
              startTranslationY,
              endTranslationY,
              startScale,
              endScale,
            )
          }
        }

        handlePanToDismissScale()
      }
    },
    onFinish: () => {
      // console.log('pan onFinish')

      const shouldDismiss = handleDismissBasedOnOpacity()
      if (shouldDismiss) {
        return
      }

      vec.set(translationOffset, translation)

      if (scale.value < BASE_SCALE) {
        resetScale()
        resetOpacity()
        resetPanXY()
      }
    },
  })

  const tapHandler = useAnimatedGestureHandler<
    TapGestureHandlerGestureEvent,
    EmptyObject
  >({
    onActive: e => {
      // console.log('tap onActive')

      if (scale.value > BASE_SCALE) {
        resetScale()
        resetPanXY()
      } else if (scale.value === BASE_SCALE) {
        const finalScale = MAX_SCALE * 0.6
        const finalImgWidth = finalScale * getCurrentImgViewWidth()
        const finalImgHeight = finalScale * getCurrentImgViewHeight()

        function doubleTapToZoomWithOriginCorrection() {
          const transformOriginX = screenWidth / 2
          const transformOriginY = screenHeight / 2

          const finalLeftEdge = (finalImgWidth - screenWidth) / finalScale / 2
          const finalRightEdge = -finalLeftEdge
          const finalTopEdge = (finalImgHeight - screenHeight) / finalScale / 2
          const finalBottomEdge = -finalTopEdge

          // Unlike displacementForOriginCorrection in the pinch handler,
          // we don't need to factor in initial scale and translation.
          // This animation always starts from BASE_SCALE value.
          const displacementX = transformOriginX - e.x
          const displacementY = transformOriginY - e.y

          const translateX = clamp(displacementX, finalRightEdge, finalLeftEdge)
          const translateY = clamp(displacementY, finalBottomEdge, finalTopEdge)

          // We only need to apply origin correction for (x, y) if the "final" (not the current)
          // image (width, height) is greater than the screen's (width, height).
          if (finalImgHeight > screenHeight) {
            translation.y.value = withTiming(translateY, {
              duration: 200,
              easing: Easing.inOut(Easing.ease),
            })
            translationOffset.y.value = translateY
          }

          if (finalImgHeight > screenWidth) {
            translation.x.value = withTiming(translateX, {
              duration: 200,
              easing: Easing.inOut(Easing.ease),
            })
            translationOffset.x.value = translateX
          }

          scaleOffset.value = finalScale - BASE_SCALE
        }

        scale.value = withTiming(finalScale, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        })

        doubleTapToZoomWithOriginCorrection()
      }
    },
  })

  const transforms = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // important to apply scale before translate for correct img edge calculation during panning
          scale: scale.value,
        },
        {
          translateX: translation.x.value,
        },
        {
          translateY: translation.y.value,
        },
      ],
    }
  })

  const backgroundColorStyles = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0,0,0,${backgroundColorOpacity.value})`,
  }))

  useAnimatedReaction(
    () => {
      // const debug = true
      const debug = false
      if (debug) {
        console.log(`
      scale: ${scale.value}
      initialScale: ${initialScale.value}
      scaleOffset: ${scaleOffset.value}
      transX: ${translation.x.value}
      transY: ${translation.y.value}
      transXOffset: ${translationOffset.x.value}
      transYOffset: ${translationOffset.y.value}
    `)
      }
    },
    () => {},
  )

  return (
    <>
      <StatusBar hidden animated />
      <PinchGestureHandler
        onGestureEvent={pinchHandler}
        simultaneousHandlers={[]}>
        <Animated.View style={[styles.fullscreen, backgroundColorStyles]}>
          <PanGestureHandler maxPointers={1} onGestureEvent={panHandler}>
            <Animated.View style={[styles.fullscreen, transforms]}>
              <TapGestureHandler
                onGestureEvent={tapHandler}
                numberOfTaps={2}
                maxDelayMs={500}
                maxDist={50}>
                <Animated.View style={styles.fullscreen}>
                  <FastImage
                    source={{ uri }}
                    style={{
                      height: aspectHeight,
                      width: aspectWidth,
                    }}
                    resizeMode="contain"
                    // @ts-expect-error missing type
                    ref={imageRef}
                    onLoad={onImageLoaded}
                    onLoadStart={() => {
                      console.log("onLoadStart")
                    }}
                    onLoadEnd={() => {
                      console.log("onLoadEnd")
                    }}
                  />
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
