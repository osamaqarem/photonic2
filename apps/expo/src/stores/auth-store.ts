import { create } from "zustand"

import { Logger, getErrorMsg } from "@photonic/common"
import { ApiError } from "@photonic/next/src/trpc/api-error"

import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import { Network } from "~/expo/lib/network"
import { SecureStorage, SecureStorageKey } from "~/expo/lib/secure-storage"
import { ZustandLogMiddleware } from "~/expo/lib/zustand-middleware"

interface AuthStoreActions {
  setSignedOut: () => Promise<void>
  setSignedIn: (data: {
    accessToken: string
    refreshToken: string
  }) => Promise<void>
  setOnline: (online: boolean) => void
  hydrate: () => void
  maybeRefresh: (
    refreshFn: (refreshToken: string) => Promise<string>,
  ) => Promise<"authorized" | "unauthorized" | "offline">
}

export interface AuthStore {
  accessToken: Nullable<string>
  online: boolean
  hydrated: boolean
  actions: AuthStoreActions
}

const logger = new Logger("AuthStore")
const logMiddleware = new ZustandLogMiddleware<AuthStore>(logger)

export const useAuth = create<AuthStore>(
  logMiddleware.connect((set, get) => ({
    accessToken: null,
    online: false,
    hydrated: false,
    actions: {
      async setSignedIn({ accessToken, refreshToken }) {
        await Promise.all([
          SecureStorage.setItemAsync(
            SecureStorageKey.RefreshToken,
            refreshToken,
          ),
          SecureStorage.setItemAsync(SecureStorageKey.AccessToken, accessToken),
        ])
        return set({ accessToken, hydrated: true })
      },
      async setSignedOut() {
        await Promise.all([
          SecureStorage.deleteItemAsync(SecureStorageKey.RefreshToken),
          SecureStorage.deleteItemAsync(SecureStorageKey.AccessToken),
        ])
        return set({ accessToken: null, hydrated: false })
      },
      setOnline(online) {
        set({ online })
      },
      async hydrate() {
        const [refreshToken, accessToken] = await Promise.all([
          SecureStorage.getItemAsync(SecureStorageKey.RefreshToken),
          SecureStorage.getItemAsync(SecureStorageKey.AccessToken),
        ])
        const { setSignedIn, setSignedOut } = get().actions
        if (accessToken && refreshToken) {
          setSignedIn({ accessToken, refreshToken })
        } else {
          setSignedOut()
        }
      },
      async maybeRefresh(refresh) {
        const Alerts = useAlerts.get()
        const { setSignedIn, setSignedOut, maybeRefresh, setOnline } =
          get().actions

        const refreshToken = await SecureStorage.getItemAsync(
          SecureStorageKey.RefreshToken,
        )
        if (!refreshToken) {
          setSignedOut()
          return "unauthorized"
        }

        try {
          const accessToken = await refresh(refreshToken)
          setSignedIn({ accessToken, refreshToken })
          Alerts.showNotification({
            message: "Logged in",
            dismissAfterMs: 1000,
          })
          return "authorized"
        } catch (err) {
          if (!(err instanceof Error)) {
            setSignedOut()
            Alerts.showError(getErrorMsg(err))
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
            setOnline(false)
            const remove = new Network().addEventListener(() => {
              if (isInternetReachable) {
                // TODO: use backoff algorithm
                maybeRefresh(refresh)
                remove()
              }
            })
            return "offline"
          } else {
            setSignedOut()
            Alerts.showError(getErrorMsg(err))
            return "unauthorized"
          }
        }
      },
    },
  })),
)
