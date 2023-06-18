export interface AuthenticatedState {
  accessToken: string
  offline: false
}

export interface UnauthenticatedState {
  accessToken: null
  offline: false
}

export interface OfflineState {
  accessToken: Nullable<string>
  offline: true
}

type AuthStoreState = AuthenticatedState | UnauthenticatedState | OfflineState

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface AuthStoreActions {
  setSignedOut: () => void
  setSignedIn: (data: Tokens) => void
  setOffline: () => void
  hydrate: () => void
  maybeRefresh: () => Promise<"authorized" | "unauthorized" | "offline">
}

export type AuthStore = AuthStoreState & {
  actions: AuthStoreActions
}
