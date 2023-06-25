import * as React from "react"
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { Circle as SVGCircle } from "react-native-svg"

import { BlurButton } from "src/design/components/Blur"
import { Icon } from "src/design/components/icons/Icons"
import { Svg } from "src/design/components/Svg"
import { colors } from "src/design/tailwind"
import { useDarkMode } from "src/stores/DarkModeProvider"

const settingsBtnSize = 42

interface SettingsBtnProps {
  onPress: () => void
  totalProgress: SharedValue<number>
}

export const SettingsBtn: React.FC<SettingsBtnProps> = ({
  onPress,
  totalProgress,
}) => {
  const circularProgressStyle = useAnimatedStyle(() => ({
    opacity: withTiming(totalProgress.value > 0 ? 1 : 0, {
      duration: 200,
      easing: Easing.linear,
    }),
  }))

  return (
    <>
      <Animated.View className="absolute" style={circularProgressStyle}>
        <CircularProgress
          totalProgress={totalProgress}
          size={settingsBtnSize + 10}
        />
      </Animated.View>
      <BlurButton
        style={{
          height: settingsBtnSize,
          width: settingsBtnSize,
        }}
        className="h-full w-10 items-center justify-center rounded-full"
        onPress={onPress}>
        <Icon name="Cog" className="h-7 w-7 text-gray-900 dark:text-gray-100" />
      </BlurButton>
    </>
  )
}

interface PropsCircleProps {
  totalProgress: SharedValue<number>
  size: number
}

const CircularProgress: React.FC<PropsCircleProps> = ({
  totalProgress,
  size,
}) => {
  const { isDarkMode } = useDarkMode()
  const stroke = colors.blue[isDarkMode ? 600 : 500]

  const rotation = useSharedValue(0)

  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circum = radius * 2 * Math.PI

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20 * 1000,
        easing: Easing.linear,
      }),
      -1,
    )
    return () => cancelAnimation(rotation)
  }, [rotation])

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const progressPct = useDerivedValue(() => {
    if (totalProgress.value === 0) return 0
    return withTiming(totalProgress.value, { duration: 1000 })
  })

  const solidCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset:
        radius * Math.PI * 2 * ((100 - progressPct.value) / 100),
    }
  })

  const commonCircleProps = {
    stroke: stroke,
    fill: "none",
    cx: size / 2,
    cy: size / 2,
    r: radius,
    strokeWidth: strokeWidth,
  }

  return (
    <>
      <Svg width={size} height={size} style={spinStyle}>
        <Circle
          {...commonCircleProps}
          strokeDasharray={2.4}
          strokeLinecap="butt"
        />
      </Svg>
      <Svg width={size} height={size} className="absolute">
        <Circle
          {...commonCircleProps}
          strokeDasharray={`${circum} ${circum}`}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          animatedProps={solidCircleProps}
        />
      </Svg>
    </>
  )
}

const Circle = Animated.createAnimatedComponent(SVGCircle)
