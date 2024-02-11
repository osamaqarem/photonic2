import { nanoid } from "~/expo/lib/nanoid"
import { storage } from "~/expo/lib/storage"

export const deviceIdStorage = {
  key: "DeviceIdKey",
  maybeCreate: () => {
    const exists = deviceIdStorage.get()
    if (exists) return
    const id = "dev_" + nanoid()
    storage.set(deviceIdStorage.key, id)
  },
  get: () => {
    const id = storage.getString(deviceIdStorage.key)
    if (!id) throw new Error("`DeviceIdKey` value was undefined.")
    return id
  },
}
