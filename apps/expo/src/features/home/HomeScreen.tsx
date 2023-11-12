import { Logger } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"

import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { DragSelectContextProvider } from "~/expo/features/home/context/DragSelectContextProvider"
import type { GenericAsset } from "~/expo/features/home/types/asset"
import type { AppParams } from "~/expo/navigation/params"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const assetRecord = useSharedValue<Record<string, GenericAsset>>({})

  const showGradientOverlay = useSharedValue(false)

  const totalUploadProgress = useSharedValue(0)

  const selectedItems = useSharedValue<Record<string, GenericAsset>>({})
  const selectedItemsKeys = useDerivedValue(() =>
    Object.keys(selectedItems.value),
  )
  const selectModeActive = useDerivedValue(
    () => selectedItemsKeys.value.length > 0,
  )
  const selectedItemsCountText = useDerivedValue(() =>
    selectedItemsKeys.value.length.toString(),
  )

  const openPhoto = (asset: GenericAsset) => {
    logger.log("openPhoto", asset.name)
    props.navigation.navigate("photo", {
      asset,
    })
  }

  const noop = () => {
    console.log("not implemented")
  }

  return (
    <DragSelectContextProvider
      assetRecord={assetRecord}
      selectedItems={selectedItems}
      selectedItemsKeys={selectedItemsKeys}
      selectModeActive={selectModeActive}
      selectedItemsCountText={selectedItemsCountText}
      showGradientOverlay={showGradientOverlay}>
      <View style={styles.root}>
        <AssetList openPhoto={openPhoto} />
        <ControlPanel.Container>
          <ControlPanel.TopPanel clearSelection={noop}>
            <ControlPanel.TopPanelBtn
              onPress={noop}
              totalProgress={totalUploadProgress}
            />
          </ControlPanel.TopPanel>
          <ControlPanel.BottomPanel
            deleteSelectedItems={noop}
            shareSelectedItems={noop}
            uploadSelectedItems={noop}>
            <ControlPanel.BottomPanelMenu
              removeSelectedItemsFromDevice={noop}
              saveSelectedItemsToDevice={noop}
              removeSelectedItemsRemotely={noop}
            />
          </ControlPanel.BottomPanel>
        </ControlPanel.Container>
      </View>
    </DragSelectContextProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
