import { PermissionStatus, usePermissions } from "expo-media-library"
import React from "react"
import mitt from "mitt"

import type {
  AssetRecordMap,
  GenericAsset,
  LocalAsset,
  LocalRemoteAsset,
  RemoteAsset,
} from "@photonic/common/asset"
import type { LocalMediaAsset } from "~/expo/features/home/utils/media-manager"
import { mediaManager } from "~/expo/features/home/utils/media-manager"
import type { RouterOutput } from "~/expo/stores/TrpcProvider"
import { trpcClient } from "~/expo/stores/TrpcProvider"
import { Logger } from "@photonic/common"

class PaginationMediator {
  private logger = new Logger("PaginationMediator")

  private localCursorId?: LocalAsset["localId"]
  private localHasNextPage = true

  private remoteCursorId?: RemoteAsset["id"]
  private remoteHasNextPage = true
  private remoteCount = 0

  public pages: Array<{
    data: Array<GenericAsset>
    params: {
      localCursorId?: string
      localHasNextPage: boolean
      remoteCursorId?: string
      remoteHasNextPage: boolean
      createdAfterMs?: number
      createdBeforeMs?: number
    }
  }> = []

  public emitter = mitt<{
    updated: void
  }>()

  private fetchLocalAssets(cursor?: string) {
    return mediaManager.getAssetsAsync({
      first: 100,
      after: cursor,
      mediaType: [
        mediaManager.MediaType.photo,
        // TODO: ExpoMedia.MediaType.video
      ],
    })
  }

  private fetchRemoteAssets(
    cursor?: string,
    createdAfterMs?: number,
    createdBeforeMs?: number,
  ) {
    return trpcClient.photo.list.query({
      limit: 100,
      cursor,
      createdAfterMs,
      createdBeforeMs,
    })
  }

  private sortByCreationTimePredicate(a: GenericAsset, b: GenericAsset) {
    return b.creationTime - a.creationTime
  }

  private getSortedData(
    local: Array<LocalMediaAsset>,
    remote: RouterOutput["photo"]["list"]["assets"],
  ): Array<GenericAsset> {
    let localAssets: Array<LocalAsset> = []
    let remoteAssets: Array<RemoteAsset> = []
    let localRemoteAssets: Array<LocalRemoteAsset> = []

    const remoteMap = new Map(remote.map(v => [v.name, v]))

    local.forEach(item => {
      const remoteItem = remoteMap.get(item.filename)
      const localAsset = mediaManager.exportLocalAsset(item)
      // LocalRemote
      if (remoteItem) {
        localRemoteAssets.push({
          ...localAsset,
          id: remoteItem.id,
          type: "LocalRemoteAsset",
        } as LocalRemoteAsset)
        remoteMap.delete(remoteItem.name)
      } else {
        // Local
        localAssets.push(localAsset)
      }
    })

    remoteMap.forEach(item =>
      remoteAssets.push({
        ...item,
        type: "RemoteAsset",
        creationTime: item.creationTime,
      }),
    )

    return [...localAssets, ...remoteAssets, ...localRemoteAssets].sort(
      this.sortByCreationTimePredicate,
    )
  }

  public async refetchPageFor(
    asset: Array<LocalMediaAsset | GenericAsset>,
  ): Promise<void> {
    let unprocessed: Array<LocalMediaAsset | GenericAsset> = []
    let stalePageIndices = new Set<number>()

    asset.forEach(item => {
      const pageIndex = this.pages.findIndex(page => {
        const newest = page.data[0]?.creationTime
        const oldest = page.data[page.data.length - 1]?.creationTime
        if (!newest || !oldest)
          throw new Error("Expected asset to have creationTime")
        if (item.creationTime >= oldest && item.creationTime <= newest) {
          return true
        }
        return false
      })
      if (pageIndex === -1) {
        unprocessed.push(item)
      } else {
        stalePageIndices.add(pageIndex)
      }
    })

    for (const index of stalePageIndices) {
      await this.refetchPageAtIndex(index)
    }

    this.emitter.emit("updated")
  }

  private async refetchPageAtIndex(index: number): Promise<void> {
    const page = this.pages[index]
    if (!page) throw new Error("Expected page to exist")
    const { params } = page

    const local = await (async () => {
      if (params.localHasNextPage) {
        const data = await this.fetchLocalAssets(params.localCursorId)
        return data.assets
      }
      return [] as Array<LocalMediaAsset>
    })()

    let remote = await (async () => {
      if (params.remoteHasNextPage) {
        const res = await this.fetchRemoteAssets(
          params.remoteCursorId,
          params.createdAfterMs,
          params.createdBeforeMs,
        )
        return res.assets
      }
      return [] as RouterOutput["photo"]["list"]["assets"]
    })()

    page.data = this.getSortedData(local, remote)
    this.emitter.emit("updated")
  }

  public async getNextPage(): Promise<void> {
    let params: (typeof this.pages)[number]["params"] = {
      localHasNextPage: this.localHasNextPage,
      localCursorId: this.localCursorId,
      remoteHasNextPage: this.remoteHasNextPage,
      remoteCursorId: this.remoteCursorId,
      createdAfterMs: undefined,
      createdBeforeMs: undefined,
    }

    this.logger.log(`getNextPage: ${this.pages.length + 1}`, params)

    if (!this.localHasNextPage && !this.remoteHasNextPage) {
      return
    }

    const local = await (async () => {
      if (this.localHasNextPage) {
        const data = await this.fetchLocalAssets(this.localCursorId)
        this.localHasNextPage = data.hasNextPage
        this.localCursorId = data.endCursor
        return data.assets
      }
      return [] as Array<LocalMediaAsset>
    })()

    // we always fetch remote assets created later than the oldest local asset
    // in case there are no more local assets, we start fetching the ones older than the oldest local asset
    // in case there were never any local assets, we fetch remote assets without a date constraint
    const last = local[local.length - 1]
    const createdAfterMs = last?.creationTime
    const createdBeforeMs = (() => {
      if (createdAfterMs) return undefined
      const prevPage = this.pages[this.pages.length - 1]
      if (!prevPage) return undefined
      const last = prevPage.data[prevPage.data.length - 1]!
      return last.creationTime
    })()

    params.createdAfterMs = createdAfterMs
    params.createdBeforeMs = createdBeforeMs

    let remote = await (async () => {
      if (this.remoteHasNextPage) {
        const res = await this.fetchRemoteAssets(
          this.remoteCursorId,
          createdAfterMs,
          createdBeforeMs,
        )

        this.remoteCount += res.assets.length
        if (this.remoteCount !== res.count) {
          this.remoteHasNextPage = true
          this.remoteCursorId =
            res.assets.length > 0
              ? res.assets[res.assets.length - 1]?.id
              : this.remoteCursorId
        } else {
          this.remoteHasNextPage = false
        }
        return res.assets
      }
      return [] as RouterOutput["photo"]["list"]["assets"]
    })()

    const data = this.getSortedData(local, remote)
    this.pages.push({ data, params })
    this.emitter.emit("updated")
  }
}

export const paginator = new PaginationMediator()

type OnData = (d: {
  assetRecords: AssetRecordMap
  assetList: Array<GenericAsset>
}) => void

export const useAssets = (onData: OnData) => {
  const [permissionResponse, requestPermission] = usePermissions()

  React.useEffect(() => {
    paginator.emitter.on("updated", () => {
      const allPages = paginator.pages.flatMap(page => page.data)
      onData({
        assetRecords: mediaManager.exportRecordMap(allPages),
        assetList: allPages,
      })
    })

    if (permissionResponse?.status !== PermissionStatus.GRANTED) {
      requestPermission()
    } else {
      paginator.getNextPage()

      const sub = mediaManager.addListener(
        async ({
          hasIncrementalChanges,
          deletedAssets,
          insertedAssets,
          updatedAssets,
        }) => {
          if (!hasIncrementalChanges) {
            console.log("sub: fetchAllAssets")
            // TODO: refetch each existing page sequentially
          } else {
            await paginator.refetchPageFor([
              ...(deletedAssets ?? []),
              ...(insertedAssets ?? []),
              ...(updatedAssets ?? []),
            ])
          }
        },
      )
      return sub.remove
    }
  }, [onData, permissionResponse?.status, requestPermission])
}
