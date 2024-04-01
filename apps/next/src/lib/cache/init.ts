import Keyv from "@keyvhq/core"

declare const global: {
  keyvClient: Keyv | undefined
}

export const cache = global.keyvClient || new Keyv()

if (process.env.NODE_ENV !== "production") global.keyvClient = cache
