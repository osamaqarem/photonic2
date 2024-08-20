import { nanoid } from "@photonic/common/nanoid"
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

const createDeviceId = (key: string) => {
  const id = "dev_" + nanoid()
  storage.set(key, id)
  return id
}

export const deviceIdStorage = {
  key: "DeviceIdKey",
  get: () => {
    const id = storage.getString(deviceIdStorage.key)
    if (!id) return createDeviceId(deviceIdStorage.key)
    return id
  },
}

export type ColorScheme = "light" | "dark"
export const colorSchemeStorage = {
  key: "ColorSchemeKey",
  get: () => storage.getString(colorSchemeStorage.key) as Maybe<ColorScheme>,
  save: (scheme: ColorScheme) => storage.set(colorSchemeStorage.key, scheme),
  delete: () => storage.delete(colorSchemeStorage.key),
}

export const lastSyncTimeStorage = {
  key: "LastSyncTimeKey",
  get: (): Maybe<number> => storage.getNumber(lastSyncTimeStorage.key),
  save: (time: number) => storage.set(lastSyncTimeStorage.key, time),
  delete: () => storage.delete(lastSyncTimeStorage.key),
}
