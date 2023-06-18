import Animated, { useSharedValue } from "react-native-reanimated"

interface Vector<T = number> {
  x: T
  y: T
}

export const useVector = (x1: number, y1?: number): Vector<Animated.SharedValue<number>> => {
  const x = useSharedValue(x1)
  const y = useSharedValue(y1 ?? x1)
  return { x, y }
}

export const isSharedVector = (
  vector: Vector<unknown>,
): vector is Vector<Animated.SharedValue<unknown>> => {
  "worklet"
  return typeof vector.x === "object" && typeof vector.y === "object"
}

const isDefinedVector = (value: unknown): value is Vector<unknown> => {
  "worklet"
  return typeof value === "object" && value !== null && "x" in value
}

export const isVector = (v: unknown): v is Vector<number> => {
  "worklet"

  if (isDefinedVector(v)) {
    return typeof v.x === "number" && typeof v.y === "number"
  }
  return false
}

export const set = (
  v: Vector<Animated.SharedValue<number>>,
  v1: number | Vector<number> | Vector<Animated.SharedValue<number>>,
): void => {
  "worklet"

  switch (typeof v1) {
    case "object":
      if (isSharedVector(v1)) {
        v.x.value = v1.x.value
        v.y.value = v1.y.value
        return
      } else {
        v.x.value = v1.x
        v.y.value = v1.y
        return
      }
    case "number":
      v.x.value = v1
      v.y.value = v1
      return
    default:
      throw new Error("Invalid value type for vec.set")
  }
}

export const create = (x1: number, y1?: number): Vector<number> => {
  "worklet"
  return {
    x: x1,
    y: y1 ?? x1,
  }
}

export type { Vector }
