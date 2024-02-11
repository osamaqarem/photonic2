import { Logger, getErrorMsg } from "@photonic/common"
import { Worker } from "@photonic/worker"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import chunk from "lodash.chunk"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"
import { Loading } from "~/expo/design/components/Loading"
import { Text } from "~/expo/design/components/Text"

import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { DragSelectContextProvider } from "~/expo/features/home/context/DragSelectContextProvider"
import { useAssets } from "~/expo/features/home/hooks/useAssets"
import { Actor } from "~/expo/features/home/utils/actor"
import {
  exportRecordMap,
  mediaManager,
} from "~/expo/features/home/utils/media-manager"
import type {
  AssetRecordMap,
  GenericAsset,
  LocalAsset,
  LocalRemoteAsset,
  RemoteAsset,
} from "./utils/media-manager"
import { Sentry } from "~/expo/lib/sentry"
import type { AppParams } from "~/expo/navigation/params"
import { trpcClient } from "~/expo/stores/TrpcProvider"
import { AssetList } from "~/expo/features/home/components/AssetList"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const { showError } = useAlerts()

  const { assets, photoDbState } = useAssets()

  const assetRecord = useDerivedValue<AssetRecordMap>(
    () => exportRecordMap(assets),
    [assets],
  )

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

  const clearSelection = () => {
    selectedItems.value = {}
  }

  /**
   * Delete assets locally and remotely
   */
  async function deleteSelectedItems() {
    let selectedRemoteAssets: Array<RemoteAsset | LocalRemoteAsset> = []
    let selectedLocalAssets: Array<LocalAsset | LocalRemoteAsset> = []

    for (const name in selectedItems.value) {
      const item = selectedItems.value[name]
      if (!item) continue
      if (item.type === "remote" || item.type === "localRemote") {
        selectedRemoteAssets.push(
          assetRecord.value[item.name] as RemoteAsset | LocalRemoteAsset,
        )
      }
      if (item.type === "local" || item.type === "localRemote") {
        selectedLocalAssets.push(
          assetRecord.value[item.name] as LocalAsset | LocalRemoteAsset,
        )
      }
    }

    try {
      logger.log("Deleting assets")
      await mediaManager.deleteAssetsAsync(selectedLocalAssets)
      clearSelection()
    } catch (err) {
      logger.log(err)
    }
  }

  /**
   * Delete assets locally
   */
  async function removeSelectedItemsFromDevice() {
    let localRemoteAssets: Array<LocalRemoteAsset> = []
    for (const name in selectedItems.value) {
      const asset = selectedItems.value[name]
      if (asset?.type === "localRemote") {
        localRemoteAssets.push(
          assetRecord.value[asset.name] as LocalRemoteAsset,
        )
      }
    }

    clearSelection()
    if (localRemoteAssets.length === 0) return

    try {
      let newState: AssetRecordMap = { ...assetRecord.value }

      await mediaManager.deleteAssetsAsync(localRemoteAssets)
      const assetUrlMap = await mediaManager.getRemoteUrl(localRemoteAssets)
      const withRemoteUrl = localRemoteAssets.filter(item =>
        Boolean(assetUrlMap[item.name]),
      )

      withRemoteUrl.forEach(item => {
        const current = newState[item.name] as LocalRemoteAsset
        const url = assetUrlMap[current.name]
        if (!url) {
          Sentry.captureException(
            new Error("LocalRemoteAsset without a valid URL"),
          )
          return
        }

        // const newAsset: RemoteAsset = {
        //   type: "remote",
        //   id: current.id,
        //   creationTime: current.creationTime,
        //   duration: current.duration,
        //   height: current.height,
        //   width: current.width,
        //   name: current.name,
        //   mediaType: current.mediaType,
        //   url,
        // }

        // newState[item.name] = newAsset
      })
    } catch (err) {
      logger.log(err)
    }
  }

  /**
   * Delete LocalRemoteAssets from remote filestorage and DB
   */
  async function removeSelectedItemsRemotely() {
    let selectedRemoteAssets: Array<LocalRemoteAsset> = []
    for (const name in selectedItems.value) {
      const asset = selectedItems.value[name]
      if (asset?.type === "localRemote") {
        selectedRemoteAssets.push(
          assetRecord.value[asset.name] as LocalRemoteAsset,
        )
      }
    }

    clearSelection()
    if (selectedRemoteAssets.length === 0) return

    try {
      await mediaManager.deleteRemoteAssets(selectedRemoteAssets)
      // TODO: list data is out of sync with record
    } catch (err) {
      showError(getErrorMsg(err))
    }
  }

  async function saveRemoteAsset(
    selectedRemoteAsset: RemoteAsset,
  ): Promise<LocalRemoteAsset> {
    const savedAsset = await mediaManager.createAssetAsync(selectedRemoteAsset)

    const creationTime = selectedRemoteAsset.creationTime.getTime()
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
    let newState = { ...assetRecord.value }
    let shouldUpdate = false

    for (const name in selectedItems.value) {
      const asset = selectedItems.value[name]
      if (asset?.type !== "remote") continue
      shouldUpdate = true

      const remoteAsset = assetRecord.value[asset.name] as RemoteAsset
      try {
        const savedAsset = await saveRemoteAsset(remoteAsset)
        newState[asset.name] = savedAsset
      } catch (err) {
        showError(getErrorMsg(err))
      }
    }

    if (shouldUpdate) {
      // TODO: test this, should lead to several incremental update. ability to pause subscription to changes
      // setState(newState)
    }
  }

  /**
   * Share selected asset
   * TODO: investigate sharing multiple assets e.g. to WhatsApp
   * TODO: some photos fail to share to messenger
   */
  async function shareSelectedItems() {
    const firstItemName = selectedItemsKeys.value[0] ?? ""
    const selectedAsset = assetRecord.value[firstItemName]
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
      mode === "selected" ? selectedItems.value : assetRecord.value

    let data: Array<LocalAsset> = []
    for (const name in collection) {
      const item = collection[name]
      if (item?.type === "local") {
        data.push(item)
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
        // await trpcClient.photo.put.mutate({ photos: group })
        if (errors.length) logger.error(errors)
      }

      // await paginator.refetchPageFor(data)
      setTimeout(() => {
        totalUploadProgress.value = 0
      }, 5_000)
    } catch (err) {
      showError(getErrorMsg(err))
    }
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
        {photoDbState !== "ready" || !assets ? (
          <Loading style={styles.loading}>
            <Text>{photoDbState?.toLowerCase()}</Text>
          </Loading>
        ) : (
          <AssetList data={assets} onItemPress={openPhoto} />
        )}
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
