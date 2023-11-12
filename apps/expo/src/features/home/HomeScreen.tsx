import { Logger } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import {
  ActivityIndicator,
  LayoutAnimation,
  StyleSheet,
  View,
} from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"

import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { DragSelectContextProvider } from "~/expo/features/home/context/DragSelectContextProvider"
import { useAssets } from "~/expo/features/home/hooks/useAssets"
import type {
  AssetRecordMap,
  GenericAsset,
  LocalAsset,
  LocalRemoteAsset,
  RemoteAsset,
} from "~/expo/features/home/types/asset"
import { mediaManager } from "~/expo/features/home/utils/media-manager"
import type { AppParams } from "~/expo/navigation/params"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const [{ assetList }, setState] = React.useState({
    loading: true,
    assetRecords: null as Nullable<AssetRecordMap>,
    assetList: null as Nullable<Array<GenericAsset>>,
  })

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

  useAssets(({ assetList, assetRecords }) => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.linear,
      duration: 150,
    })
    setState({ assetList, assetRecords, loading: false })
    assetRecord.value = assetRecords
  })

  const openPhoto = (asset: GenericAsset) => {
    logger.log("openPhoto", asset.name)
    props.navigation.navigate("photo", {
      asset,
    })
  }

  const clearSelection = () => {
    selectedItems.value = {}
  }

  /**
   * Delete assets locally and remotely
   */
  async function deleteSelectedItems() {
    let selectedRemoteAssets: Array<RemoteAsset | LocalRemoteAsset> = []
    let selectedLocalAssets: Array<LocalAsset | LocalRemoteAsset> = []
    let newState: AssetRecordMap = { ...assetRecord.value }

    for (const name in selectedItems.value) {
      const item = selectedItems.value[name]
      if (!item) continue
      if (item.type === "RemoteAsset" || item.type === "LocalRemoteAsset") {
        selectedRemoteAssets.push(
          assetRecord.value[item.name] as RemoteAsset | LocalRemoteAsset,
        )
      }
      if (item.type === "LocalAsset" || item.type === "LocalRemoteAsset") {
        selectedLocalAssets.push(
          assetRecord.value[item.name] as LocalAsset | LocalRemoteAsset,
        )
      }
      delete newState[item.name]
    }

    clearSelection()

    try {
      logger.log("Deleting assets")
      await Promise.all([
        mediaManager.deleteAssetsAsync(selectedLocalAssets),
        mediaManager.deleteRemoteAssets(selectedRemoteAssets),
      ])
    } catch (err) {
      logger.log(err)
    }
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
        {assetList ? (
          <AssetList assetList={assetList} openPhoto={openPhoto} />
        ) : (
          <Loading />
        )}
        <ControlPanel.Container>
          <ControlPanel.TopPanel clearSelection={clearSelection}>
            <ControlPanel.TopPanelBtn
              onPress={noop}
              totalProgress={totalUploadProgress}
            />
          </ControlPanel.TopPanel>
          <ControlPanel.BottomPanel
            deleteSelectedItems={deleteSelectedItems}
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

const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator color={"white"} />
  </View>
)

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
