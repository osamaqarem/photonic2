export const NOOP = () => {}

export class Logger {
  constructor(public prefix: string, public disabled?: boolean) {
    this.prefix = prefix
    this.disabled = disabled
  }

  private handleDisabled = (fn: (...args: Array<unknown>) => void) =>
    this.disabled ? NOOP : fn

  private format = (p: Array<unknown>) => {
    return p.map(p => JSON.stringify(p, null, 2))
  }

  log = this.handleDisabled((...args: Array<unknown>) => {
    console.log(`📬 ${this.prefix}:`, ...this.format(args))
  })

  warn = this.handleDisabled((...args: Array<unknown>) => {
    console.log(`🍌 ${this.prefix}:`, ...this.format(args))
  })

  error = this.handleDisabled((...args: Array<unknown>) => {
    console.log(`🥊 ${this.prefix}:`, ...this.format(args))
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
