import * as React from "react"
import type {
  ScrollViewProps as RNScrollViewProps,
  StyleProp,
  ViewProps as RNViewProps,
  ViewStyle,
} from "react-native"
import {
  ScrollView as RNScrollView,
  StyleSheet,
  View as RNView,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button } from "~/expo/design/components/Button"
import { theme } from "~/expo/design/theme"

const getBottomPadding = (bottomInset: number) =>
  bottomInset > 0 ? bottomInset : 30

interface ScrollViewProps extends RNScrollViewProps {
  stickyViewHeight?: number
}

const ScrollViewExotic = React.forwardRef<
  RNScrollView,
  React.PropsWithChildren<ScrollViewProps>
>((props, ref) => {
  const { bottom: bottomInset } = useSafeAreaInsets()

  return (
    <RNScrollView
      keyboardDismissMode="interactive"
      {...props}
      ref={ref}
      style={[styles.scrollView, props.style]}
      contentContainerStyle={[
        {
          paddingBottom:
            getBottomPadding(bottomInset) +
            (props.stickyViewHeight ?? Button.height),
        },
        props.contentContainerStyle,
      ]}
    />
  )
})

interface StickyViewProps extends RNViewProps {
  containerStyle?: StyleProp<ViewStyle>
}
const StickyView: React.FC<StickyViewProps> = ({
  containerStyle,
  style,
  ...props
}) => {
  const { bottom: bottomInset } = useSafeAreaInsets()

  return (
    <RNView
      style={[
        styles.stickyContainer,
        {
          bottom: getBottomPadding(bottomInset),
        },
        containerStyle,
      ]}>
      <RNView {...props} style={[styles.stickyView, style]} />
    </RNView>
  )
}

export const ScrollView = Object.assign(ScrollViewExotic, {
  StickyView,
})

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: theme.space.contentPadding,
    backgroundColor: theme.colors.background,
  },
  stickyContainer: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
  },
  stickyView: {
    paddingHorizontal: theme.space.contentPadding,
  },
})
