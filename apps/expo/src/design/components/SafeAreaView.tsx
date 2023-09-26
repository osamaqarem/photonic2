import * as React from "react"
import type { ViewProps as RNViewProps } from "react-native"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { theme } from "~/expo/design/theme"

interface Props extends RNViewProps {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}
export const SafeAreaView: React.FC<Props> = React.memo(
  ({ style, ...props }) => {
    const { top, bottom, left, right } = useSafeAreaInsets()

    return (
      <View
        {...props}
        style={[
          styles.bg,
          {
            paddingTop: props.top ? top : undefined,
            paddingBottom: props.bottom ? bottom : undefined,
            paddingLeft: props.left ? left : undefined,
            paddingRight: props.right ? right : undefined,
          },
          style,
        ]}
      />
    )
  },
)

const styles = StyleSheet.create({
  bg: {
    backgroundColor: theme.colors.background,
  },
})
