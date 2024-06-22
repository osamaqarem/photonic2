import { nanoid } from "~/expo/lib/nanoid"
import { storage } from "~/expo/lib/storage"

const key = "DeviceIdKey"

const create = () => {
  const id = "dev_" + nanoid()
  storage.set(key, id)
  return id
}

export const deviceIdStorage = {
  get: () => {
    const id = storage.getString(key)
    if (!id) return create()
    return id
  },
}
