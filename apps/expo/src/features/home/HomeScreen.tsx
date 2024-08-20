import { Worker } from "@photonic/worker"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import chunk from "lodash.chunk"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"

import { Logger, assert, invariant } from "@photonic/common"
import { assetRepo } from "~/expo/db/asset-repo"
import type { Asset } from "~/expo/db/schema"
import { Loading } from "~/expo/design/components/Loading"
import { Text } from "~/expo/design/components/Text"
import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { useAssets } from "~/expo/hooks/useAssets"
import { Actor } from "~/expo/lib/actor"
import { handleError } from "~/expo/lib/error"
import { mediaService } from "~/expo/services/media-service"
import type { AppParams } from "~/expo/navigation/params"
import { DragSelectContextProvider } from "~/expo/providers/DragSelectContextProvider"
import { trpcClient } from "~/expo/providers/TrpcProvider"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const { assets, assetMap, loading, syncRemote, refetchAssets } = useAssets()

  const showGradientOverlay = useSharedValue(false)

  const totalUploadProgress = useSharedValue(0)

  const selectedItems = useSharedValue<Record<string, Asset>>({})
  const selectedItemsKeys = useDerivedValue(() =>
    Object.keys(selectedItems.value),
  )
  const selectModeActive = useDerivedValue(
    () => selectedItemsKeys.value.length > 0,
  )
  const selectedItemsCountText = useDerivedValue(() =>
    selectedItemsKeys.value.length.toString(),
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
    const selectedList = selectedItemsKeys.value.map(
      name => assetMap.value[name],
    ) as Array<Asset>
    try {
      logger.log("Deleting assets")
      await Promise.all([
        mediaService.deleteLocalAssets(selectedList),
        mediaService.deleteRemoteAssets(selectedList, [
          "remote",
          "localRemote",
        ]),
        assetRepo.delete(selectedList),
      ])
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
    const selectedList = selectedItemsKeys.value.map(
      name => assetMap.value[name],
    ) as Array<Asset>
    clearSelection()
    try {
      await Promise.all([
        mediaService.deleteLocalAssets(selectedList),
        assetRepo.delete(selectedList),
      ])
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
    const selectedList = selectedItemsKeys.value.map(
      name => assetMap.value[name],
    ) as Array<Asset>
    clearSelection()
    try {
      await Promise.all([
        mediaService.deleteRemoteAssets(selectedList, [
          "localRemote",
          "remote",
        ]),
        assetRepo.delete(selectedList),
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

  async function saveRemoteAsset(selectedRemoteAsset: Asset): Promise<Asset> {
    invariant(
      selectedRemoteAsset.type === "remote",
      "saveRemoteAsset: not remote asset",
    )

    // `renameRemoteAsset` causes `updatedAt` to be refreshed for the remote asset, so the next remote sync will reconcile the state for this asset
    const savedAsset = await mediaService.createAssetAsync(selectedRemoteAsset)
    const creationTime = selectedRemoteAsset.creationTime

    await mediaService.modifyAssetAsync(savedAsset, {
      creationTime,
    })

    await mediaService.renameRemoteAsset(
      selectedRemoteAsset,
      savedAsset.filename,
    )
    await syncRemote(true)

    return {
      ...selectedRemoteAsset,
      name: savedAsset.filename,
      type: "localRemote",
      uri: savedAsset.uri,
      localId: savedAsset.id,
    }
  }

  /**
   * Download selected assets to device
   */
  async function saveSelectedItemsToDevice() {
    for (const name in selectedItems.value) {
      const asset = selectedItems.value[name]
      if (asset?.type !== "remote") continue

      const remoteAsset = assetMap.value[asset.name]
      assert(remoteAsset)
      try {
        await saveRemoteAsset(remoteAsset)
        await assetRepo.update([remoteAsset])
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
    const firstItemName = selectedItemsKeys.value[0]
    assert(firstItemName)

    const selectedAsset = assetMap.value[firstItemName]
    clearSelection()
    if (!selectedAsset) return

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
      mode === "selected" ? selectedItems.value : assetMap.value

    let data: Array<Omit<Asset, "localId"> & { localId: string }> = []
    for (const name in collection) {
      const item = collection[name]
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
      selectedItemsKeys={selectedItemsKeys}
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
