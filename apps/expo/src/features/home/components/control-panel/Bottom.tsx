import * as React from "react"
import {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { StyleSheet, View, type ViewProps } from "react-native"
import { Icon } from "~/expo/design/components/icons/Icons"
import { theme } from "~/expo/design/theme"
import { BlurView } from "~/expo/features/home/components/control-panel/BlurPressable"
import { useDarkMode } from "~/expo/state/DarkModeProvider"
import { useDragSelectContext } from "~/expo/state/DragSelectContextProvider"
import { Option } from "./Option"

const bottomPanelHeight = 120

type BottomPanelType = React.FC<
  React.PropsWithChildren<{
    deleteSelectedItems: () => void
    shareSelectedItems: () => void
    uploadSelectedItems: () => void
  }>
> & { bottomPanelHeight: number }

export const BottomPanel: BottomPanelType = props => {
  const {
    deleteSelectedItems,
    shareSelectedItems,
    uploadSelectedItems,
    children,
  } = props

  const { selectModeActive } = useDragSelectContext()

  const { bottom: bottomInset } = useSafeAreaInsets()

  const sharedColorScheme = useDarkMode(s => s.sharedColorScheme)

  const animatedProps = useAnimatedProps<{
    pointerEvents: ViewProps["pointerEvents"]
  }>(() => ({
    pointerEvents: selectModeActive.value ? "auto" : "none",
  }))

  const bottomPanelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(selectModeActive.value ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
    backgroundColor:
      sharedColorScheme.value === "dark"
        ? "rgba(0,0,0,.6)"
        : "rgba(255,255,255,.5)",
  }))

  return (
    <BlurView
      animatedProps={animatedProps}
      style={[
        styles.menu,
        {
          height: BottomPanel.bottomPanelHeight + bottomInset,
          paddingBottom: bottomInset,
        },
        bottomPanelStyle,
      ]}>
      <View
        style={[
          styles.items,
          {
            paddingTop: bottomInset,
          },
        ]}>
        <Option
          title="Share"
          onPress={shareSelectedItems}
          icon={ArrowUpSquare}
        />
        <SpaceX />
        <Option title="Backup" onPress={uploadSelectedItems} icon={CloudUp} />
        <SpaceX />
        <Option title="Delete" onPress={deleteSelectedItems} icon={Trash} />
        <SpaceX />
        {children}
      </View>
    </BlurView>
  )
}

BottomPanel.bottomPanelHeight = bottomPanelHeight

const ArrowUpSquare = () => (
  <Icon name="ArrowUpSquare" style={styles.blueIcon} />
)
const CloudUp = () => <Icon name="CloudUp" style={styles.blueIcon} />
const Trash = () => <Icon name="Trash" style={styles.trash} />

const SpaceX = () => <View style={styles.space} />

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  items: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  blueIcon: {
    height: 28,
    width: 28,
    color: theme.colors.primary,
  },
  trash: {
    height: 28,
    width: 28,
    color: theme.colors.danger,
  },
  space: {
    width: 28,
  },
})
