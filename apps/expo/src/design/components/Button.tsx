import * as React from "react"
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { font, rawThemeColors, theme } from "src/design/theme"
import { useDarkMode } from "src/stores/DarkModeProvider"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const enum ButtonState {
  Active,
  Loading,
  Disabled,
}

interface Props extends Omit<PressableProps, "disabled"> {
  text: string
  state?: ButtonState
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export const Button: React.FC<Props> & { height: number } = ({
  style,
  text,
  textStyle,
  state = ButtonState.Active,
  ...props
}) => {
  const pressed = useSharedValue(false)

  const colorScheme = useDarkMode(state => state.sharedColorScheme)

  const animatedStyle = useAnimatedStyle(() => {
    const config = { duration: 150 }
    return {
      backgroundColor: withTiming(
        pressed.value
          ? rawThemeColors.elementBgActive[colorScheme.value]
          : rawThemeColors.elementBg[colorScheme.value],
        config,
      ),
      transform: [{ scale: withTiming(pressed.value ? 0.95 : 1, config) }],
    }
  })

  const renderContent = () => {
    switch (state) {
      case ButtonState.Active:
        return <Text style={[styles.text, textStyle]}>{text}</Text>
      case ButtonState.Loading:
        return (
          <ActivityIndicator
            size={"small"}
            color={theme.colors.loadingIndicator}
          />
        )
      case ButtonState.Disabled:
        return (
          <Text style={[styles.text, styles.textDisabled, textStyle]}>
            {text}
          </Text>
        )
    }
  }

  const onPress: Props["onPress"] = e => {
    if (state === ButtonState.Disabled || state === ButtonState.Loading) {
      return
    }
    props.onPress?.(e)
  }

  const onPressIn: Props["onPressIn"] = e => {
    pressed.value = true
    props.onPressIn?.(e)
  }

  const onPressOut: Props["onPressOut"] = e => {
    pressed.value = false
    props.onPressOut?.(e)
  }

  return (
    <AnimatedPressable
      {...props}
      style={[animatedStyle, styles.btn, style]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      {renderContent()}
    </AnimatedPressable>
  )
}

Button.height = 70

const styles = StyleSheet.create({
  btn: {
    backgroundColor: theme.colors.elementBg,
    height: Button.height,
    width: 180,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  text: font().size("l").weight("regular").style,
  textDisabled: {
    color: theme.colors.textLowContrast,
  },
})
