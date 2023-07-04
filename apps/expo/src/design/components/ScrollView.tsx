import * as React from "react"
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
  StyleProp,
  StyleSheet,
  View as RNView,
  ViewProps as RNViewProps,
  ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button } from "~/design/components/Button"
import { theme } from "~/design/theme"

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
        styles.scrollViewContent,
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
  },
  scrollViewContent: {
    backgroundColor: theme.colors.background,
  },
  stickyContainer: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
  },
  stickyView: {
    paddingHorizontal: theme.space.contentPadding,
  },
})
