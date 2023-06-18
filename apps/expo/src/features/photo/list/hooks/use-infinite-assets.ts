import * as React from "react"

// import { useQuery } from "@tanstack/react-query"
// import { trpcReact } from "app/providers/trpc/trpc"
import { GenericAsset, RemoteAsset } from "../types/asset"
import { Media } from "../utils/media"

const fetchLocalAssets = async () => {
  const raw = await Media.getAssetsAsync({
    first: Infinity,
    mediaType: [
      Media.MediaType.photo,
      // TODO: ExpoMedia.MediaType.video
    ],
  })
  const list = raw.assets.map(Media.exportLocalAsset)
  const record = Media.exportRecord(list)
  return record
}

interface Options {
  hasPermissions: boolean
  onData: (newState: Record<string, GenericAsset>) => void
}

const remoteLimit = 10

export const useInfiniteAssets = ({ hasPermissions, onData }: Options) => {
  const localQuery = useQuery({
    queryKey: ["local.photo.list"],
    queryFn: fetchLocalAssets,
    onSuccess: onData,
    enabled: hasPermissions,
    staleTime: Infinity, // this query should never happen again
    cacheTime: 0, // no need to cache data for a query that wont happen again
    structuralSharing: false,
  })

  const remoteQuery = trpcReact.photo.list.useInfiniteQuery(
    { limit: remoteLimit },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  React.useEffect(() => {
    type QueryState =
      | "BothSuccess"
      | "LocalSuccess"
      | "RemoteSucess"
      | "BothNotSuccess"

    const state: QueryState = (() => {
      if (localQuery.isSuccess && remoteQuery.isSuccess) {
        return "BothSuccess"
      } else if (localQuery.isError && remoteQuery.isSuccess) {
        return "RemoteSucess"
      } else if (localQuery.isSuccess && remoteQuery.isError) {
        return "LocalSuccess"
      } else {
        return "BothNotSuccess"
      }
    })()

    switch (state) {
      case "LocalSuccess":
      case "BothNotSuccess":
        return
      case "RemoteSucess":
        const remote = Media.exportRecord(
          remoteQuery
            .data!.pages.map(page => page.assets)
            .flat()
            .map(item => ({ ...item, type: "RemoteAsset" })),
        )
        onData(remote)
        return
      case "BothSuccess":
        const final = { ...localQuery.data }
        remoteQuery
          .data!.pages.map(page => page.assets)
          .flat()
          .forEach(item => {
            const localCopy = final[item.name]
            if (localCopy) {
              // TODO: local file hash vs remote file hash
              localCopy.type = "LocalRemoteAsset"
            } else {
              final[item.name] = {
                ...item,
                type: "RemoteAsset",
              } as RemoteAsset
            }
          })
        onData(final)
        return
    }
  }, [
    localQuery.data,
    localQuery.isError,
    localQuery.isSuccess,
    remoteQuery.data,
    remoteQuery.isError,
    remoteQuery.isSuccess,
    onData,
  ])

  React.useEffect(() => {
    if (localQuery.data) {
      Media.addListener(event => {
        if (event.hasIncrementalChanges) {
          // patch
        } else {
          // full fetch
        }
      })
    }
    return Media.removeAllListeners
  }, [localQuery.data])
}

useInfiniteAssets.remoteLimit = remoteLimit
