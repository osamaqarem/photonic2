import * as React from "react"
import { View } from "react-native"
import {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BlurView } from "src/design/components/Blur"
import { Icon } from "src/design/components/icons/Icons"
import { useSharedValueContext } from "src/features/photo/list/context/SharedValueContext"
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

  const { selectModeActive } = useSharedValueContext()

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
      className="flex-row justify-between self-center overflow-hidden rounded-t-3xl bg-gray-100/50 dark:bg-black-800/50"
      style={[
        {
          height: BottomPanel.bottomPanelHeight + bottomInset,
          paddingBottom: bottomInset,
        },
        bottomPanelStyle,
      ]}>
      <View
        className="flex-1 flex-row justify-between px-5"
        style={{ paddingTop: bottomInset }}>
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
  <Icon name="ArrowUpSquare" className="h-7 w-7 text-blue-600" />
)
const CloudUp = () => <Icon name="CloudUp" className="h-7 w-7 text-blue-600" />
const Trash = () => <Icon name="Trash" className="h-7 w-7 text-red-600" />

const SpaceX = () => <View className="w-7" />
