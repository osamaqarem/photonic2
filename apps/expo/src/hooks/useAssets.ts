import React from "react"
import { type Asset } from "~/expo/db/schema"
import { useSafeIntervalRef } from "~/expo/hooks/useSafeIntervalRef"
import { mediaService } from "~/expo/services/media-service"
import { syncService } from "~/expo/services/sync-service"

export const useAssets = () => {
  const [assets, setAssets] = React.useState<Array<Asset>>([])
  const [loading, setLoading] = React.useState(true)

  const remoteSyncInterval = useSafeIntervalRef()

  const refreshQuery = React.useCallback(async (fetchLocalDataMode = false) => {
    const data = await mediaService.getLocalAssets(fetchLocalDataMode)
    setAssets(data)
  }, [])

  const syncRemote = React.useCallback(
    async (force = false) => {
      await syncService.maybeSyncRemote(assets, force)
      await refreshQuery()
    },
    [assets, refreshQuery],
  )

  React.useEffect(() => {
    ;(async () => {
      await refreshQuery()
      setLoading(false)

      await syncRemote()
      remoteSyncInterval.current = setInterval(syncRemote, 60_000)
    })()
  }, [refreshQuery, remoteSyncInterval, syncRemote])

  return {
    assets,
    loading,
    syncRemote,
    refetchAssets: refreshQuery,
  }
}
