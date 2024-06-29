import { createNextApiHandler } from "@trpc/server/adapters/next"

import { Logger } from "@photonic/common"
import { appRouter } from "~/next/trpc/_app"
import { createContext } from "~/next/trpc/context"

const logger = new Logger("@trpc/server")

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error, path }) {
    logger.error({
      message: error.message,
      code: error.code,
      path: path,
    })
    if (error.code === "INTERNAL_SERVER_ERROR") {
      error.message =
        "An unexpected error occured. We have been notified. Please try again later."
    }
    error.stack = undefined // hide from frontend
  },
})
