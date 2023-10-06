import type { Logger } from "@photonic/common"
import type { StateCreator, StoreApi } from "zustand"

type Middleware<S> = (
  config: StateCreator<S>,
) => (
  set: StoreApi<S>["setState"],
  get: StoreApi<S>["getState"],
  api: StoreApi<S>,
) => S

export class ZustandLogMiddleware<StoreType extends object> {
  constructor(private logger: Logger) {
    this.logger = logger
  }

  connect: Middleware<StoreType> = config => (set, get, api) =>
    config(
      args => {
        this.logger.log(
          Object.keys(args).map(v => (v ? `${v}: set` : `${v}: clear`)),
        )
        set(args)
      },
      get,
      api,
    )
}
