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

import { ComponentVariantMap, getThemeColorWorklet } from "~/design/variant"
import { font, theme } from "~/design/theme"
import { useDarkMode } from "~/stores/DarkModeProvider"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const enum ButtonState {
  Active,
  Loading,
  Disabled,
}

type Sizes = "default" | "wide" | "small"
type Variants = "primary" | "secondary"
type InteractionStates = "default" | "pressed"

interface Props extends Omit<PressableProps, "disabled"> {
  text: string
  state?: ButtonState
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  size?: Sizes
  variant?: Variants
}

export const Button: React.FC<Props> & { height: number } = ({
  style,
  text,
  textStyle,
  state = ButtonState.Active,
  size = "default",
  variant = "primary",
  ...props
}) => {
  const pressed = useSharedValue(false)

  const colorScheme = useDarkMode(state => state.sharedColorScheme)

  const animatedStyle = useAnimatedStyle(() => {
    const config = { duration: 150 }
    return {
      backgroundColor: withTiming(
        pressed.value
          ? animatedVariantStyle[variant].pressed.backgroundColor(
              colorScheme.value,
            )
          : animatedVariantStyle[variant].default.backgroundColor(
              colorScheme.value,
            ),
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
      style={[
        animatedStyle,
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
    alignSelf: "flex-end",
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
  wide: {
    width: 200,
  },
  small: {
    width: 120,
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
