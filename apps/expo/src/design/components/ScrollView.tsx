import * as React from "react"
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { theme } from "src/design/theme"

import { Button } from "./Button"

const getBottomPadding = (bottomInset: number) =>
  bottomInset > 0 ? bottomInset + 4 : 30

/**
 * A scroll view with default horizontal and top padding and an optional sticky button at the bottom.
 * Respects safe area margins.
 *
 * Usage:
    <View style={{ flex: 1 }}>
      <ScrollView>
        {
          // ...content
        }
      </ScrollView>
      <ScrollView.StickyButton text="Text" onPress={() => {}} />
    </View>
 */
const ScrollViewExotic = React.forwardRef<
  RNScrollView,
  React.PropsWithChildren<RNScrollViewProps>
>((props, ref) => {
  const { bottom: bottomInset } = useSafeAreaInsets()

  return (
    <RNScrollView
      keyboardDismissMode="interactive"
      {...props}
      ref={ref}
      contentContainerStyle={[
        styles.scrollView,
        {
          paddingBottom: getBottomPadding(bottomInset) + Button.height,
        },
        props.contentContainerStyle,
      ]}
    />
  )
})

interface StickyButtonProps extends React.ComponentProps<typeof Button> {
  containerStyle?: StyleProp<ViewStyle>
}

const StickyButton: React.FC<StickyButtonProps> = props => {
  const { bottom: bottomInset } = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.btnContainer,
        {
          bottom: getBottomPadding(bottomInset),
        },
        props.containerStyle,
      ]}>
      <Button {...props} />
    </View>
  )
}

export const ScrollView = Object.assign(ScrollViewExotic, { StickyButton })

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: theme.colors.background,
  },
  btnContainer: {
    position: "absolute",
    alignSelf: "center",
  },
})
