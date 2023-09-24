import { createNextApiHandler } from "@trpc/server/adapters/next"

import { Logger } from "@photonic/common"
import { appRouter } from "~/trpc/_app"
import { createContext } from "~/trpc/context"

const logger = new Logger("@trpc/server")

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error, path }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      // TODO: send to bug reporting
      logger.error(
        "path: " + path,
        "message: " + error.message,
        error.cause ?? "",
      )
    } else {
      logger.log(
        "path: " + path,
        "message: " + error.message,
        error.cause ?? "",
      )
    }
  },
})
