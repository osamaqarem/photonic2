import { Worker } from "@photonic/worker"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import chunk from "lodash.chunk"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"

import { Logger, assert } from "@photonic/common"
import type { Asset } from "~/expo/db/schema"
import { Loading } from "~/expo/design/components/Loading"
import { Text } from "~/expo/design/components/Text"
import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { useAssets } from "~/expo/hooks/useAssets"
import { Actor } from "~/expo/lib/actor"
import { getAssetMap } from "~/expo/lib/asset-map"
import { handleError } from "~/expo/lib/error"
import type { AppParams } from "~/expo/navigation/params"
import { DragSelectContextProvider } from "~/expo/providers/DragSelectContextProvider"
import { trpcClient } from "~/expo/providers/TrpcProvider"
import { mediaService } from "~/expo/services/media-service"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const { assets, loading, syncRemote, refetchAssets } = useAssets()

  const assetMap = useDerivedValue(() => getAssetMap(assets))

  const showGradientOverlay = useSharedValue(false)

  const totalUploadProgress = useSharedValue(0)

  const selectedItems = useSharedValue<Record<string, Asset>>({})

  const getSelectedAssets = (): Array<Asset> => Object.values(selectedItems)

  const selectModeActive = useDerivedValue(
    () => Object.keys(selectedItems.value).length > 0,
  )
  const selectedItemsCountText = useDerivedValue(() =>
    Object.keys(selectedItems.value).length.toString(),
  )

  const openPhoto = (asset: Asset) => {
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
    const selectedList = Object.values(selectedItems.value)
    try {
      await mediaService.deleteAssets(selectedList)
      clearSelection()
      await refetchAssets()
    } catch (error) {
      handleError({
        error,
        message: "An error occured while deleting photos.",
        transactionName: deleteSelectedItems.name,
      })
    }
  }

  /**
   * Delete assets locally
   */
  async function removeSelectedItemsFromDevice() {
    clearSelection()
    try {
      await mediaService.deleteAssets(getSelectedAssets())
      await refetchAssets()
    } catch (error) {
      handleError({
        error,
        message:
          "An error occured while deleting selected items from your device.",
        transactionName: removeSelectedItemsFromDevice.name,
      })
    }
  }

  /**
   * Delete LocalRemoteAssets from remote filestorage and DB
   */
  async function removeSelectedItemsRemotely() {
    clearSelection()
    try {
      await mediaService.deleteAssets(getSelectedAssets(), [
        "localRemote",
        "remote",
      ])
      await refetchAssets()
    } catch (error) {
      handleError({
        error,
        message: "An error occured while deleting.",
        transactionName: removeSelectedItemsRemotely.name,
      })
    }
  }

  /**
   * Download selected assets to device
   */
  async function saveSelectedItemsToDevice() {
    for (const selectedItem of Object.values(selectedItems.value)) {
      if (selectedItem?.type !== "remote") continue
      try {
        await mediaService.saveRemoteAsset(selectedItem)
        syncRemote()
      } catch (error) {
        handleError({
          error,
          message: "An error occured while downloading photos to your device.",
          transactionName: saveSelectedItemsToDevice.name,
        })
      }
    }
  }

  async function shareSelectedItems() {
    const selectedAsset = selectedItems.value[0]
    assert(selectedAsset)
    clearSelection()
    try {
      await mediaService.share(selectedAsset)
    } catch (error) {
      handleError({
        error,
        message: "An error occured while sharing photos.",
        transactionName: shareSelectedItems.name,
      })
    }
  }

  const goToSettings = () => props.navigation.navigate("settings")

  const uploadAssets = async (mode: "selected" | "all") => {
    const collection =
      mode === "selected" ? Object.values(selectedItems.value) : assets

    let data: Array<Omit<Asset, "localId"> & { localId: string }> = []
    for (const item of collection) {
      if (item?.type === "local") {
        assert(item.localId)
        data.push(item as (typeof data)[number])
      }
    }

    clearSelection()

    try {
      const lock = new Actor()

      const onProgress = async (percentage: number) => {
        await lock.acquire()
        totalUploadProgress.value = percentage
        lock.release()
      }

      for (const group of chunk(data, 10)) {
        const assets = await trpcClient.photo.getSignedUploadUrl.query(group)
        const errors = await Worker.uploadAssets(
          { assets, concurrency: group.length },
          onProgress,
        )
        await trpcClient.photo.put.mutate({ photos: group })
        if (errors.length) logger.error(errors)
      }

      await syncRemote(true)

      setTimeout(() => {
        totalUploadProgress.value = 0
      }, 5_000)
    } catch (error) {
      handleError({
        error,
        message: "An error occured while uploading photos.",
        transactionName: uploadAssets.name,
      })
    }
  }

  const renderList = () => {
    if (loading) {
      return (
        <Loading style={styles.loading}>
          <Text>Loading...</Text>
        </Loading>
      )
    }
    return <AssetList data={assets} onItemPress={openPhoto} />
  }

  return (
    <DragSelectContextProvider
      assetMap={assetMap}
      selectedItems={selectedItems}
      selectModeActive={selectModeActive}
      selectedItemsCountText={selectedItemsCountText}
      showGradientOverlay={showGradientOverlay}>
      <View style={styles.root}>
        {renderList()}
        <ControlPanel.Container>
          <ControlPanel.TopPanel clearSelection={clearSelection}>
            <ControlPanel.TopPanelBtn
              onPress={goToSettings}
              totalProgress={totalUploadProgress}
            />
          </ControlPanel.TopPanel>
          <ControlPanel.BottomPanel
            deleteSelectedItems={deleteSelectedItems}
            shareSelectedItems={shareSelectedItems}
            uploadSelectedItems={() => uploadAssets("selected")}>
            <ControlPanel.BottomPanelMenu
              removeSelectedItemsFromDevice={removeSelectedItemsFromDevice}
              saveSelectedItemsToDevice={saveSelectedItemsToDevice}
              removeSelectedItemsRemotely={removeSelectedItemsRemotely}
            />
          </ControlPanel.BottomPanel>
        </ControlPanel.Container>
      </View>
    </DragSelectContextProvider>
  )
}

const styles = StyleSheet.create({
  loading: { rowGap: 20 },
  root: {
    flex: 1,
  },
})
