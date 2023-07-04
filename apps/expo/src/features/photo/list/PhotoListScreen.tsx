import { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"
import { LayoutAnimation } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"
import { UploadService } from "@photonic/upload-service"
import { UploadEvent } from "@photonic/upload-service/types"
import { Logger } from "@photonic/common"

import { useAlerts } from "~/design/components/alerts/useAlerts"
import { Layout } from "~/design/components/Layout"
import type {
  GenericAsset,
  LocalAsset,
  LocalRemoteAsset,
  RemoteAsset,
} from "~/features/photo/list/models/asset"
import { Media } from "~/features/photo/list/utils/media"
import { AppParams } from "~/navigation/params"
// import { PhotoRouterInputs } from "~/providers/trpc/inference"
// import { trpcClient } from "~/providers/trpc/trpc"
import { ControlPanel } from "./components/control-panel/ControlPanel"
import { List } from "./components/List"
import { SharedValueContext } from "./context/SharedValueContext"
// import { useInfiniteAssets } from "./hooks/use-infinite-assets"
// import { useMediaPermissions } from "./hooks/use-media-permissions"

export const PhotoListScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const { showError } = useAlerts()

  const [assetRecordState, setAssetRecordState] = React.useState<
    Record<string, GenericAsset>
  >({})
  const assetRecord = useSharedValue<Record<string, GenericAsset>>({})

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

  const showGradientOverlay = useSharedValue(false)

  const totalUploadProgress = useSharedValue(0)
  const totalUploadProgressDelayed = useSharedValue(0)
  const timeout = React.useRef<NodeJS.Timeout>()

  const setState = React.useCallback((newState: typeof assetRecordState) => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.linear,
      duration: 150,
    })
    setAssetRecordState(newState)
    assetRecord.value = newState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useInfiniteAssets({
  //   hasPermissions: useMediaPermissions(),
  //   onData: setState,
  // })

  const assetList = React.useMemo(() => {
    logger.log("Sorting")
    const items = Object.values(assetRecordState).sort((a, b) => {
      if (a.creationTime < b.creationTime) {
        return 1
      } else if (a.creationTime > b.creationTime) {
        return -1
      } else {
        return 0
      }
    })
    logger.log(`Finished sorting: ${items.length}`)
    return items
  }, [assetRecordState])

  //#region features
  async function uploadLocalAssets(mode: "All" | "OnlySelected" = "All") {
    const updateTotalProgress = (value: number) => {
      totalUploadProgress.value = value
      if (value === 0) {
        // cleaner way of doing this?
        clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
          totalUploadProgressDelayed.value = value
        }, 3 * 1000)
      } else {
        totalUploadProgressDelayed.value = value
      }
    }

    const sourceListData =
      mode === "OnlySelected" ? { ...selectedItems.value } : assetRecord.value
    clearSelection()

    // chunking
    let localAssets: Array<PhotoRouterInputs["get-upload-url"]> = [[]]
    let index = 0
    let chunkSize = 5
    let itemCount = 0

    for (const name in sourceListData) {
      const current = assetRecord.value[name]
      if (current?.type === "LocalAsset") {
        if (localAssets[index]?.length === chunkSize) {
          index++
          localAssets[index] = []
        }
        localAssets[index]?.push(
          current as (typeof localAssets)[number][number],
        )
        itemCount += 1
      }
    }

    let uploadedItems = 0
    if (itemCount > 0) {
      updateTotalProgress(0.1)
    }

    try {
      for (const chunk of localAssets) {
        logger.log("Getting chunk signed upload urls")
        const tasks = await trpcClient.photo["get-upload-url"].query(chunk)
        if (!tasks) {
          return
        }

        let nextStateStartUpload = { ...assetRecord.value }
        chunk.forEach(item => {
          ;(nextStateStartUpload[item.name] as LocalAsset).uploadProgressPct =
            "1"
        })
        assetRecord.value = nextStateStartUpload

        logger.log("Starting chunk upload")
        let processing = false
        await new Promise<void>(nextChunk => {
          UploadService.uploadAssets(
            tasks,
            (updatedItems: Array<UploadEvent>) => {
              processing = true
              const nextState = { ...assetRecord.value }
              for (const { name, percent, error } of updatedItems) {
                if (error) {
                  showError.handle(error)
                  continue
                }
                const current = assetRecord.value[name]
                if (current?.type === "LocalAsset") {
                  if (percent === "100") {
                    uploadedItems += 1
                    logger.log(`${uploadedItems}/${itemCount}`)
                    updateTotalProgress((uploadedItems / itemCount) * 100)

                    const newItem: LocalRemoteAsset = {
                      ...current,
                      type: "LocalRemoteAsset",
                    }
                    nextState[name] = newItem
                  } else {
                    const newItem: LocalAsset = {
                      ...current,
                      uploadProgressPct: percent,
                    }
                    nextState[name] = newItem
                  }
                }
              }
              assetRecord.value = nextState
              processing = false
            },
            async () => {
              // Make sure onProgress callback is finished before onComplete runs
              await new Promise<void>(resolveInterval => {
                let int = setInterval(() => {
                  if (!processing) {
                    clearInterval(int)
                    resolveInterval()
                  }
                }, 200)
              })

              const photos: Array<LocalRemoteAsset> = chunk.map(
                item => assetRecord.value[item.name] as LocalRemoteAsset,
              )
              await trpcClient.photo.put.mutate({ photos })

              nextChunk()
            },
          )
        })

        logger.log("Completed chunk")
      }
    } catch (err) {
      showError.handle(err)
    } finally {
      updateTotalProgress(0)
    }
  }

  /**
   * Delete assets locally and remotely
   */
  async function deleteSelectedItems() {
    let selectedRemoteAssets: Array<RemoteAsset | LocalRemoteAsset> = []
    let selectedLocalAssets: Array<LocalAsset | LocalRemoteAsset> = []
    let newState: Record<string, GenericAsset> = { ...assetRecord.value }

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
        Media.deleteAssetsAsync(selectedLocalAssets),
        Media.deleteRemoteAssets(selectedRemoteAssets),
      ])

      setState(newState)
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

      await Media.deleteAssetsAsync(localRemoteAssets)
      const assetUrlMap = await Media.getRemoteUrl(localRemoteAssets)

      localRemoteAssets.forEach(item => {
        const current = newState[item.name] as LocalRemoteAsset
        const newAsset: RemoteAsset = {
          type: "RemoteAsset",
          creationTime: current.creationTime,
          duration: current.duration,
          height: current.height,
          width: current.width,
          name: current.name,
          mediaType: current.mediaType,
          url: assetUrlMap[current.name] ?? "url_not_found",
        }

        newState[item.name] = newAsset
      })

      setState(newState)
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
      await Media.deleteRemoteAssets(selectedRemoteAssets)

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

      assetRecord.value = newState
    } catch (err) {
      logger.log(err)
    }
  }

  async function saveRemoteAsset(
    selectedRemoteAsset: RemoteAsset,
  ): Promise<LocalRemoteAsset> {
    const savedAsset = await Media.createAssetAsync(selectedRemoteAsset)

    const creationTime = selectedRemoteAsset.creationTime
    await Media.modifyAssetAsync(savedAsset, {
      creationTime,
    })

    // update its file name on s3 & ddb
    await Media.renameRemoteAsset(selectedRemoteAsset, savedAsset.filename)

    return {
      ...selectedRemoteAsset,
      name: savedAsset.filename,
      type: "LocalRemoteAsset",
      localUri: savedAsset.uri,
      localIdentifier: savedAsset.id,
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
        showError.handle(err)
      }
    }

    if (shouldUpdate) {
      setState(newState)
    }
  }

  // Share selected asset
  // TODO: investigate sharing multiple assets e.g. to WhatsApp
  // TODO: some photos fail to share to messenger. investigate why.
  async function shareSelectedItems() {
    const firstItemName = selectedItemsKeys.value[0] ?? ""
    const selectedAsset = assetRecord.value[firstItemName]
    clearSelection()
    if (!selectedAsset) return
    try {
      await Media.share(selectedAsset)
    } catch (err) {
      logger.log(err)
    }
  }

  const openPhoto = (asset: GenericAsset) => {
    logger.log("openPhoto", asset.name)
    props.navigation.navigate("photo", {
      asset,
    })
  }

  const clearSelection = () => {
    selectedItems.value = {}
  }

  const goToSettings = () => props.navigation.navigate("settings-stack")
  //#endregion features

  return (
    <SharedValueContext.Provider
      value={{
        assetRecord,
        selectedItems,
        selectedItemsKeys,
        selectModeActive,
        selectedItemsCountText,
        showGradientOverlay,
      }}>
      <Layout.View className="bg-white dark:bg-black">
        <List openPhoto={openPhoto} assetList={assetList} />
        <ControlPanel.Container>
          <ControlPanel.TopPanel clearSelection={clearSelection}>
            <ControlPanel.TopPanelBtn
              onPress={goToSettings}
              totalProgress={totalUploadProgressDelayed}
            />
          </ControlPanel.TopPanel>
          <ControlPanel.BottomPanel
            deleteSelectedItems={deleteSelectedItems}
            shareSelectedItems={shareSelectedItems}
            uploadSelectedItems={() => uploadLocalAssets("OnlySelected")}>
            <ControlPanel.BottomPanelMenu
              removeSelectedItemsFromDevice={removeSelectedItemsFromDevice}
              saveSelectedItemsToDevice={saveSelectedItemsToDevice}
              removeSelectedItemsRemotely={removeSelectedItemsRemotely}
            />
          </ControlPanel.BottomPanel>
        </ControlPanel.Container>
      </Layout.View>
    </SharedValueContext.Provider>
  )
}

const logger = new Logger(PhotoListScreen.displayName ?? "PhotoListScreen")
