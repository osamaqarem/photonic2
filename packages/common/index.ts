export const NOOP = () => {}

export class Logger {
  constructor(public prefix: string, public disabled?: boolean) {
    this.prefix = prefix
    this.disabled = disabled
  }

  handleDisabled = (fn: (...args: Array<unknown>) => void) =>
    this.disabled ? NOOP : fn

  log = this.handleDisabled((...args: Array<unknown>) => {
    console.log(`📬 ${this.prefix}:`, ...args)
  })

  warn = this.handleDisabled((...args: Array<unknown>) => {
    console.log(`🍌 ${this.prefix}:`, ...args)
  })

  error = this.handleDisabled((...args: Array<unknown>) => {
    console.log(`🥊 ${this.prefix}:`, ...args)
  })
}

export function getErrorMsg(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  } else if (typeof err === "string") {
    return err
  } else {
    return "Something went wrong"
  }
}
