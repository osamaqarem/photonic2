export const NOOP = () => {}

export const DEV =
  __DEV__ || (process.env.NODE_ENV === "development" && typeof window !== "undefined")

export class Logger {
  prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
    if (!__DEV__) return { log: NOOP, warn: NOOP, error: NOOP, prefix }
  }

  log = (...args: Array<unknown>) => {
    console.log(`📬 ${this.prefix}:`, ...args)
  }
  warn = (...args: Array<unknown>) => {
    console.log(`🍌 ${this.prefix}:`, ...args)
  }
  error = (...args: Array<unknown>) => {
    console.log(`🥊 ${this.prefix}:`, ...args)
  }
}
