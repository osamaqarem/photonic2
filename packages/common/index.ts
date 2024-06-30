export const NOOP = () => {}

export class Logger {
  // Only disable for React Native release builds
  private disabled = typeof __DEV__ === "boolean" ? !__DEV__ : false

  constructor(private prefix: string) {}

  private handleDisabled = (fn: (...args: Array<unknown>) => void) => {
    return this.disabled ? NOOP : fn
  }

  private print = ({
    level,
    args,
  }: {
    level: string
    args: Array<unknown>
  }) => {
    console.log(
      JSON.stringify({
        level,
        context: this.prefix,
        timestamp: new Date().toISOString(),
        log: args,
      }),
    )
  }

  log = this.handleDisabled((...args: Array<unknown>) => {
    this.print({ level: "info 🌥️", args })
  })

  warn = this.handleDisabled((...args: Array<unknown>) => {
    this.print({ level: "warn ❕", args })
  })

  error = this.handleDisabled((...args: Array<unknown>) => {
    this.print({ level: "error ⛔️", args })
  })
}

export function getErrorMsg(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  } else if (typeof err === "string") {
    return err
  } else {
    return "An unexpected error occured."
  }
}

export function assert<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be defined: ${value}`)
  }
}

export function invariant(value: boolean, message: string) {
  if (!value) {
    throw new Error(`Invariant: ${message}`)
  }
}
