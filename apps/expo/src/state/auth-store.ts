import type { StateCreator, StoreApi } from "zustand"
import { create } from "zustand"

import { Logger } from "@photonic/common"

import { createJSONStorage, persist } from "zustand/middleware"
import { SecureStorage } from "~/expo/lib/secure-storage"

export const createLoggingMiddleware =
  <StoreType extends object>(logger: Logger) =>
  (config: StateCreator<StoreType>) =>
  (
    set: StoreApi<StoreType>["setState"],
    get: StoreApi<StoreType>["getState"],
    api: StoreApi<StoreType>,
  ) => {
    return config(
      args => {
        logger.log(
          Object.keys(args).map(v => (v ? `${v}: set` : `${v}: clear`)),
        )
        set(args)
      },
      get,
      api,
    )
  }

const logger = new Logger("AuthStore")
const loggingMiddleware = createLoggingMiddleware<AuthStore>(logger)
const middleware = (creator: StateCreator<AuthStore>) => {
  return persist(loggingMiddleware(creator), {
    name: "auth_store",
    storage: createJSONStorage(() => ({
      getItem: SecureStorage.getItem,
      removeItem: SecureStorage.deleteItemAsync,
      setItem: SecureStorage.setItem,
    })),
    partialize: (state: AuthStore) =>
      Object.fromEntries(
        Object.entries(state).filter(([k]) => k !== "actions"),
      ),
  })
}

export interface IdTokenPayload {
  id: string
  awsAccountId: Nullable<string>
  email: string
  sub: string
}

interface AuthStoreActions {
  signOut: () => void
  signIn: (data: {
    idToken: string
    accessToken: string
    refreshToken: string
  }) => IdTokenPayload
  setOnline: (online: boolean) => void
  finishOnboarding: () => void
}

export interface AuthStore {
  user: Nullable<IdTokenPayload>
  accessToken: Nullable<string>
  refreshToken: Nullable<string>
  online: boolean
  onboardingDone: boolean
  actions: AuthStoreActions
}

export const useAuth = create<AuthStore, [["zustand/persist", unknown]]>(
  middleware(set => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    online: true,
    onboardingDone: false,
    actions: {
      signIn({ accessToken, idToken, refreshToken }) {
        const user = decodeIdToken(idToken)
        set({ accessToken, refreshToken, user })
        return user
      },
      signOut() {
        set({ accessToken: null, refreshToken: null, user: null })
      },
      setOnline(online) {
        set({ online })
      },
      finishOnboarding() {
        set({ onboardingDone: true })
      },
    },
  })),
)

export const decodeIdToken = (jwt: string): IdTokenPayload => {
  const payload = jwt.split(".")[1]
  if (!payload) throw new Error("Invalid jwt")
  return JSON.parse(atob(payload))
}
