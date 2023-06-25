import * as React from "react"
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { Text } from "src/design/components/Text"
import { font, rawThemeColors, theme } from "src/design/theme"
import { useDarkMode } from "src/stores/DarkModeProvider"

const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput)

export const TextInput: React.FC<TextInputProps> = props => {
  const focused = useSharedValue(false)

  const colorScheme = useDarkMode(state => state.sharedColorScheme)

  const borderStyle = useAnimatedStyle(() => {
    const config = { duration: 150 }

    if (focused.value) {
      return {
        borderColor: withTiming(
          rawThemeColors.borderFocused[colorScheme.value],
          config,
        ),
      }
    } else if (props.editable === false) {
      return {
        borderColor: theme.colors.borderDisabled,
      }
    } else {
      return {
        borderColor: withTiming(
          rawThemeColors.border[colorScheme.value],
          config,
        ),
      }
    }
  })

  return (
    <>
      <AnimatedTextInput
        placeholderTextColor={theme.colors.textLowContrast}
        selectionColor={theme.colors.textLowContrast}
        {...props}
        onFocus={e => {
          props.onFocus?.(e)
          focused.value = true
        }}
        onBlur={e => {
          props.onBlur?.(e)
          focused.value = false
        }}
        style={[
          borderStyle,
          styles.input,
          props.style,
          props.editable === false ? styles.notEditable : undefined,
          props.placeholder ? styles.placeholder : undefined,
        ]}
      />
      <Text
        variant="span"
        style={{
          marginTop: 6,
          marginLeft: 6,
          color: theme.colors.warning,
        }}>
        Error you are bad
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 60,
    padding: 10,
    borderRadius: 18,
    borderWidth: 2,
    color: theme.colors.text,
    ...font().size("s").weight("medium").style,
  },
  notEditable: {
    color: theme.colors.textLowContrast,
  },
  placeholder: font().weight("medium").style,
})
