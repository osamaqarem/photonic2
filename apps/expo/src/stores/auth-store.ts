import { create } from "zustand"

import { Logger, getErrorMsg } from "@photonic/common"
import { ApiError } from "@photonic/next/src/trpc/api-error"

import { alertsEmitter } from "~/expo/design/components/alerts/AlertsContext"
import { Network } from "~/expo/lib/network"
import { SecureStorage, SecureStorageKey } from "~/expo/lib/secure-storage"
import { ZustandLogMiddleware } from "~/expo/lib/zustand-middleware"

interface AuthStoreActions {
  finishOnboarding: () => void
  setSignedOut: () => Promise<void>
  setSignedIn: (data: {
    accessToken: string
    refreshToken: string
    onboardingDone: boolean
  }) => Promise<void>
  setOnline: (online: boolean) => void
  hydrate: () => void
  maybeRefresh: (
    refreshFn: (refreshToken: string) => Promise<string>,
  ) => Promise<"authorized" | "unauthorized" | "offline">
}

export interface AuthStore {
  userId: Nullable<string>
  accessToken: Nullable<string>
  onboardingDone: boolean
  online: boolean
  hydrated: boolean
  actions: AuthStoreActions
}

const logger = new Logger("AuthStore")
const logMiddleware = new ZustandLogMiddleware<AuthStore>(logger)

export const useAuth = create<AuthStore>(
  logMiddleware.connect((set, get) => ({
    userId: null,
    accessToken: null,
    onboardingDone: false,
    online: false,
    hydrated: false,
    actions: {
      finishOnboarding() {
        return set({ onboardingDone: true })
      },

      async setSignedIn({ accessToken, refreshToken, onboardingDone = false }) {
        const payload = accessToken.split(".")[1]
        if (!payload) throw new Error("Invalid access token")

        const decoded = JSON.parse(atob(payload))
        if (typeof decoded?.sub !== "string") {
          return get().actions.setSignedOut()
        }

        await Promise.all([
          SecureStorage.setItemAsync(
            SecureStorageKey.RefreshToken,
            refreshToken,
          ),
          SecureStorage.setItemAsync(SecureStorageKey.AccessToken, accessToken),
        ])

        return set({
          accessToken,
          userId: decoded.sub,
          hydrated: true,
          onboardingDone,
        })
      },

      async setSignedOut() {
        await Promise.all([
          SecureStorage.deleteItemAsync(SecureStorageKey.RefreshToken),
          SecureStorage.deleteItemAsync(SecureStorageKey.AccessToken),
        ])
        return set({ accessToken: null, hydrated: true })
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
          setSignedIn({ accessToken, refreshToken, onboardingDone: true })
        } else {
          setSignedOut()
        }
      },

      async maybeRefresh(refresh) {
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
          setSignedIn({ accessToken, refreshToken, onboardingDone: true })
          alertsEmitter.emit("showNotification", {
            message: "Logged in",
            dismissAfterMs: 1000,
          })
          return "authorized"
        } catch (err) {
          if (!(err instanceof Error)) {
            setSignedOut()
            alertsEmitter.emit("showError", getErrorMsg(err))
            return "unauthorized"
          }

          const expired = err.message === ApiError.InvalidRefreshToken
          const { isInternetReachable } =
            await new Network().getNetworkStateAsync()
          const userMaybeOffline = err.message === "Network request failed"
          const serverDown =
            err.message === "JSON Parse error: Unexpected token: <"

          if (expired) {
            alertsEmitter.emit(
              "showError",
              "Session expired. Please sign-in again.",
            )
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
            alertsEmitter.emit("showError", getErrorMsg(err))
            return "unauthorized"
          }
        }
      },
    },
  })),
)
