import * as SecureStorage from "expo-secure-store"

const enum SecureStorageKey {
  RefreshToken = "RefreshToken",
  AccessToken = "AccessToken",
}

export { SecureStorage, SecureStorageKey }
