import type { useSafeAreaInsets as nativeHook } from "./use-safe-area"

export const useSafeAreaInsets = (): ReturnType<typeof nativeHook> => {
  return {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  }
}
