import type { SecureStorageService } from "./secure-storage"

// TODO: not secure. create new auth flow for web without localstorage
export const SecureStorage: SecureStorageService = {
  getItemAsync: () => Promise.resolve(""),
  setItemAsync: () => Promise.resolve(),
  deleteItemAsync: () => Promise.resolve(),
}
