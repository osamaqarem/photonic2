export class Actor {
  constructor(
    public locked = false,
    public waitQueue = [] as Array<() => void>,
  ) {}

  acquire() {
    return new Promise<void>(resolve => {
      if (!this.locked) {
        this.locked = true
        resolve()
      } else {
        this.waitQueue.push(resolve)
      }
    })
  }

  release() {
    if (this.waitQueue.length > 0) {
      const nextResolve = this.waitQueue.shift()
      nextResolve?.()
    } else {
      this.locked = false
    }
  }
}
