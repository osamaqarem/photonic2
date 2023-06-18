export function clamp(value: number, min: number, max: number) {
  "worklet"
  return Math.min(Math.max(value, min), max)
}

// Interpolate a value with 'extend' extrapolation outside the range
export function interpolateValue(
  value: number,
  OLD_MIN: number,
  OLD_MAX: number,
  NEW_MIN: number,
  NEW_MAX: number,
) {
  "worklet"
  return ((NEW_MIN - NEW_MAX) / (OLD_MIN - OLD_MAX)) * (value - OLD_MIN) + NEW_MIN
}
