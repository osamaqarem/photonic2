import chunk from "lodash.chunk"
import { Logger, getErrorMsg } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import {
  ActivityIndicator,
  LayoutAnimation,
  StyleSheet,
  View,
} from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"
import { Worker } from "@photonic/worker"

import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { DragSelectContextProvider } from "~/expo/features/home/context/DragSelectContextProvider"
import { paginator, useAssets } from "~/expo/features/home/hooks/useAssets"
import type {
  AssetRecordMap,
  GenericAsset,
  LocalAsset,
  LocalRemoteAsset,
  RemoteAsset,
} from "@photonic/common/asset"
import { mediaManager } from "~/expo/features/home/utils/media-manager"
import { Sentry } from "~/expo/lib/sentry"
import type { AppParams } from "~/expo/navigation/params"
import { trpcClient } from "~/expo/stores/TrpcProvider"
import { Actor } from "~/expo/features/home/utils/actor"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const [{ assetList }, setState] = React.useState({
    loading: true,
    assetList: [] as Array<GenericAsset>,
  })

  const { showError } = useAlerts()

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

  useAssets(
    React.useCallback(
      ({ assetList, assetRecords }) => {
        LayoutAnimation.configureNext({
          ...LayoutAnimation.Presets.linear,
          duration: 150,
        })
        setState({ assetList, loading: false })
        assetRecord.value = { ...assetRecords }
      },
      [assetRecord],
    ),
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

    try {
      logger.log("Deleting assets")
      await Promise.all([
        mediaManager.deleteAssetsAsync(selectedLocalAssets),
        mediaManager.deleteRemoteAssets(selectedRemoteAssets),
      ])
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
      if (asset?.type === "LocalRemoteAsset") {
        localRemoteAssets.push(
          assetRecord.value[asset.name] as LocalRemoteAsset,
        )
      }
    }

    clearSelection()
    if (localRemoteAssets.length === 0) return

    try {
      let newState: Record<string, GenericAsset> = { ...assetRecord.value }

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

        const newAsset: RemoteAsset = {
          type: "RemoteAsset",
          id: current.id,
          creationTime: current.creationTime,
          duration: current.duration,
          height: current.height,
          width: current.width,
          name: current.name,
          mediaType: current.mediaType,
          url,
        }

        // TODO: patch remote assets query data vs full rmeote data refetch
        newState[item.name] = newAsset
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
      if (asset?.type === "LocalRemoteAsset") {
        selectedRemoteAssets.push(
          assetRecord.value[asset.name] as LocalRemoteAsset,
        )
      }
    }

    clearSelection()
    if (selectedRemoteAssets.length === 0) return

    try {
      await mediaManager.deleteRemoteAssets(selectedRemoteAssets)

      let newState: Record<string, GenericAsset> = { ...assetRecord.value }
      selectedRemoteAssets.forEach(item => {
        const current = newState[item.name] as LocalRemoteAsset
        const localAsset: LocalAsset = {
          ...current,
          type: "LocalAsset",
          uploadProgressPct: "0",
        }
        newState[item.name] = localAsset
      })

      // TODO: list data is out of sync with record
      // refetch remote assets or patch query
      assetRecord.value = newState
    } catch (err) {
      logger.log(err)
    }
  }

  async function saveRemoteAsset(
    selectedRemoteAsset: RemoteAsset,
  ): Promise<LocalRemoteAsset> {
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
      type: "LocalRemoteAsset",
      localUri: savedAsset.uri,
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
      if (asset?.type !== "RemoteAsset") continue
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
      if (item?.type === "LocalAsset") {
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
        await trpcClient.photo.put.mutate({ photos: group })
        if (errors.length) logger.error(errors)
      }

      await paginator.refetchPageFor(data)
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
        {assetList ? (
          <AssetList data={assetList} onItemPress={openPhoto} />
        ) : (
          <Loading />
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
