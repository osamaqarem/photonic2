export const NOOP = () => {}

export class Logger {
  prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
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
