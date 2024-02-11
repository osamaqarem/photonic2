import * as ExpoCrypto from "expo-crypto"

declare const global: {
  crypto?: {
    getRandomValues: unknown
  }
} & typeof globalThis

global.crypto = {
  ...global.crypto,
  getRandomValues: ExpoCrypto.getRandomValues,
}
