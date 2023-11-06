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
import { palette } from "~/expo/design/palette"
import { theme } from "~/expo/design/theme"
import { BlurView } from "~/expo/features/home/components/control-panel/BlurButton"
import { useDragSelectContext } from "~/expo/features/home/context/DragSelectContextProvider"
import { Option } from "./Option"

const bottomPanelHeight = 120
// TODO:
// backup:              when LocalAssets are selected
// save:                when RemoteAssets are selected
// share:               any
// delete:              any
// delete from device:  when LocalRemoteAssets are selected
// delete backup:       when LocalRemoteAssets/RemoteAssets are selected
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
    backgroundColor: theme.colors.elementSecondaryBg,
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
    color: palette.light.blue.blue7,
  },
  trash: {
    height: 28,
    width: 28,
    color: palette.light.tomato.tomato7,
  },
  space: {
    width: 28,
  },
})
