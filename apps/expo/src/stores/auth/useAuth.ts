import { create } from "zustand"
import * as SecureStorage from "expo-secure-store"

// import { ApiError } from "api/server/errors"
import { useAlerts } from "~/design/components/alerts/useAlerts"
import type {
  AuthenticatedState,
  AuthStore,
  OfflineState,
  UnauthenticatedState,
} from "~/stores/auth/types"
import { Network } from "~/lib/network"
// import { trpcClient } from "~/providers/trpc/trpc"

const enum StorageKey {
  RefreshToken = "RefreshToken",
  AccessToken = "AccessToken",
}

export const useAuth = create<AuthStore>((set, getState) => ({
  accessToken: null,
  offline: false,
  actions: {
    setSignedIn({ accessToken, refreshToken }) {
      const state: AuthenticatedState = {
        accessToken,
        offline: false,
      }
      set(state)
      SecureStorage.setItemAsync(StorageKey.RefreshToken, refreshToken)
      SecureStorage.setItemAsync(StorageKey.AccessToken, accessToken)
    },
    setSignedOut() {
      const state: UnauthenticatedState = {
        accessToken: null,
        offline: false,
      }
      set(state)
      SecureStorage.deleteItemAsync(StorageKey.RefreshToken)
      SecureStorage.deleteItemAsync(StorageKey.AccessToken)
    },
    setOffline() {
      const state: OfflineState = {
        accessToken: getState().accessToken,
        offline: true,
      }
      set(state)
    },
    async hydrate() {
      const [refreshToken, accessToken] = await Promise.all([
        SecureStorage.getItemAsync(StorageKey.RefreshToken),
        SecureStorage.getItemAsync(StorageKey.AccessToken),
      ])
      const { setSignedIn, setSignedOut } = getState().actions
      if (accessToken && refreshToken) {
        setSignedIn({ accessToken, refreshToken })
      } else {
        setSignedOut()
      }
    },
    async maybeRefresh() {
      const Alerts = useAlerts.get()
      const { setSignedIn, setSignedOut, setOffline, maybeRefresh } =
        getState().actions

      const refreshToken = await SecureStorage.getItemAsync(
        StorageKey.RefreshToken,
      )
      if (!refreshToken) {
        setSignedOut()
        return "unauthorized"
      }

      try {
        const accessToken = await trpcClient.auth.refresh.query({
          refreshToken,
        })
        setSignedIn({ accessToken, refreshToken })
        Alerts.showNotification({ message: "Logged in", dismissAfterMs: 1000 })
        return "authorized"
      } catch (err) {
        if (!(err instanceof Error)) {
          setSignedOut()
          Alerts.showError.handle(err)
          return "unauthorized"
        }

        const expired = err.message === ApiError.InvalidRefreshToken
        const { isInternetReachable } =
          await new Network().getNetworkStateAsync()
        const userMaybeOffline = err.message === "Network request failed"
        const serverDown =
          err.message === "JSON Parse error: Unexpected token: <"

        if (expired) {
          Alerts.showError("Session expired. Please sign-in again.")
          setSignedOut()
          return "unauthorized"
        } else if (!isInternetReachable || serverDown || userMaybeOffline) {
          setOffline()
          const remove = new Network().addEventListener(() => {
            if (isInternetReachable) {
              maybeRefresh()
              remove()
            }
          })
          return "offline"
        } else {
          setSignedOut()
          Alerts.showError.handle(err)
          return "unauthorized"
        }
      }
    },
  },
}))
