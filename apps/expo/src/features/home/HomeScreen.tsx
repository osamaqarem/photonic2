import { Logger, assert, getErrorMsg, invariant } from "@photonic/common"
import { Worker } from "@photonic/worker"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import chunk from "lodash.chunk"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"
import { Loading } from "~/expo/design/components/Loading"
import { Text } from "~/expo/design/components/Text"

import type { Asset } from "~/expo/db/schema"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { useAssets } from "~/expo/hooks/useAssets"
import { Actor } from "~/expo/lib/actor"
import { mediaManager } from "~/expo/lib/media-manager"
import type { AppParams } from "~/expo/navigation/params"
import { DragSelectContextProvider } from "~/expo/state/DragSelectContextProvider"
import { trpcClient } from "~/expo/state/TrpcProvider"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const { showError } = useAlerts()

  const { assets, assetMap, loading } = useAssets()

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
    const selectedList = selectedItemsKeys.value.map(name =>
      assetMap.get(name),
    ) as Array<Asset>
    try {
      logger.log("Deleting assets")
      await mediaManager.deleteLocalAssets(selectedList)
      clearSelection()
    } catch (err) {
      logger.log(err)
    }
  }

  /**
   * Delete assets locally
   */
  async function removeSelectedItemsFromDevice() {
    const selectedList = selectedItemsKeys.value.map(name =>
      assetMap.get(name),
    ) as Array<Asset>
    clearSelection()
    try {
      await mediaManager.deleteLocalAssets(selectedList)
    } catch (err) {
      logger.log(err)
    }
  }

  /**
   * Delete LocalRemoteAssets from remote filestorage and DB
   */
  async function removeSelectedItemsRemotely() {
    const selectedList = selectedItemsKeys.value.map(name =>
      assetMap.get(name),
    ) as Array<Asset>
    clearSelection()
    try {
      await mediaManager.deleteRemoteAssets(selectedList, ["localRemote"])
    } catch (err) {
      showError(getErrorMsg(err))
    }
  }

  async function saveRemoteAsset(selectedRemoteAsset: Asset): Promise<Asset> {
    invariant(
      selectedRemoteAsset.type === "remote",
      "saveRemoteAsset: not remote asset",
    )

    const savedAsset = await mediaManager.createAssetAsync(selectedRemoteAsset)
    const creationTime = selectedRemoteAsset.creationTime
    await mediaManager.modifyAssetAsync(savedAsset, {
      creationTime,
    })

    await mediaManager.renameRemoteAsset(
      selectedRemoteAsset,
      savedAsset.filename,
    )

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

      const remoteAsset = assetMap.get(asset.name)
      assert(remoteAsset)
      try {
        await saveRemoteAsset(remoteAsset)
      } catch (err) {
        showError(getErrorMsg(err))
      }
    }
  }

  /**
   * Share selected asset
   * TODO: investigate sharing multiple assets e.g. to WhatsApp
   * TODO: some photos fail to share to messenger
   */
  async function shareSelectedItems() {
    const firstItemName = selectedItemsKeys.value[0]
    assert(firstItemName)

    const selectedAsset = assetMap.get(firstItemName)
    clearSelection()
    if (!selectedAsset) return

    try {
      await mediaManager.share(selectedAsset)
    } catch (err) {
      logger.log(err)
    }
  }

  const goToSettings = () => props.navigation.navigate("settings")

  const uploadAssets = async (mode: "selected" | "all") => {
    const collection =
      mode === "selected" ? selectedItems.value : Object.fromEntries(assetMap)

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
      setTimeout(() => {
        totalUploadProgress.value = 0
      }, 5_000)
    } catch (err) {
      showError(getErrorMsg(err))
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
