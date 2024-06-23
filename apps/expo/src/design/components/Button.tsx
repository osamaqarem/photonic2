import * as React from "react"
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { font, theme } from "~/expo/design/theme"
import type { ComponentVariantMap } from "~/expo/design/variant"
import { getThemeColorWorklet } from "~/expo/design/variant"
import { useDarkMode } from "~/expo/state/DarkModeProvider"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const enum ButtonState {
  Active,
  Loading,
  Disabled,
}

type Sizes = "default" | "small" | "wide" | "widest"
type Variants = "primary" | "secondary"
type InteractionStates = "default" | "pressed"

interface Props extends Omit<PressableProps, "disabled"> {
  text: string
  state?: ButtonState
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  size?: Sizes
  variant?: Variants
  animatedStyle?: {
    backgroundColor?: string
    pressedBackgroundColor?: string
  }
}

export const Button: React.FC<Props> & { height: number } = ({
  style,
  text,
  textStyle,
  state = ButtonState.Active,
  size = "default",
  variant = "primary",
  animatedStyle,
  ...props
}) => {
  const pressed = useSharedValue(false)

  const colorScheme = useDarkMode(state => state.sharedColorScheme)

  const btnAnimatedStyle = useAnimatedStyle(() => {
    const config = { duration: 150 }

    const bgColor =
      animatedStyle?.backgroundColor ??
      animatedVariantStyle[variant].default.backgroundColor(colorScheme.value)
    const pressedBgColor =
      animatedStyle?.pressedBackgroundColor ??
      animatedVariantStyle[variant].pressed.backgroundColor(colorScheme.value)

    return {
      backgroundColor: withTiming(
        pressed.value ? pressedBgColor : bgColor,
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
    if (state === ButtonState.Loading) {
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
      style={[
        btnAnimatedStyle,
        styles.btn,
        sizeStyles[size],
        variantStyles[variant],
        style,
      ]}
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
    height: Button.height,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    ...font().size("m").weight("regular").style,
    textAlign: "center",
    paddingHorizontal: theme.space.scale[10],
  },
  textDisabled: {
    color: theme.colors.textLowContrast,
  },
})

const sizeStyles: ComponentVariantMap<Sizes, ViewStyle> = {
  default: {
    width: 180,
  },
  small: {
    width: 120,
  },
  wide: {
    width: 200,
  },
  widest: {
    width: 280,
  },
}

const variantStyles: ComponentVariantMap<Variants, ViewStyle> = {
  primary: {},
  secondary: {},
}

const animatedVariantStyle = {
  primary: {
    default: {
      backgroundColor: getThemeColorWorklet("elementBg"),
    },
    pressed: {
      backgroundColor: getThemeColorWorklet("elementBgActive"),
    },
  },
  secondary: {
    default: {
      backgroundColor: getThemeColorWorklet("elementSecondaryBg"),
    },
    pressed: {
      backgroundColor: getThemeColorWorklet("elementSecondaryBgActive"),
    },
  },
} satisfies ComponentVariantMap<
  Variants,
  ComponentVariantMap<InteractionStates, unknown>
>
