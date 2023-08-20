import * as React from "react"
import type { TextInputProps} from "react-native";
import { TextInput as TextInputRN } from "react-native"
import { styled } from "nativewind"
import colors from "tailwindcss/colors"

export const TextInput: React.FC<TextInputProps> = styled(props => {
  const editable = typeof props.editable === "boolean" ? props.editable : true

  return (
    <TextInputRN
      placeholderTextColor={colors.gray[600]}
      {...props}
      className={
        editable
          ? "text-gray-900 dark:text-gray-300"
          : "text-gray-700 dark:text-gray-500"
      }
      style={[
        props.style,
        {
          paddingHorizontal: 4,
        },
      ]}
    />
  )
}, "w-full rounded-md border-b-2 border-gray-300 dark:border-gray-700 text-lg h-[50] px-1")

TextInput.displayName = "TextInput"
