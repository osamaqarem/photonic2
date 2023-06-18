import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store"

export const SecureStorage = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
}

export type SecureStorageService = typeof SecureStorage
