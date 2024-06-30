import { createNextApiHandler } from "@trpc/server/adapters/next"
import { getHTTPStatusCodeFromError } from "@trpc/server/http"
import { ZodError } from "zod"

import { Logger } from "@photonic/common"
import { nanoid } from "@photonic/common/nanoid"
import { appRouter } from "~/next/trpc/_app"
import { createContext } from "~/next/trpc/context"

const logger = new Logger("@trpc/server")

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error, path, input }) {
    if (error.cause instanceof ZodError) {
      error.message = error.cause.errors.map(e => e.message).join("\n")
    }
    const requestId = nanoid()
    logger.error({
      statusCode: getHTTPStatusCodeFromError(error),
      code: error.code,
      message: error.message,
      path: path,
      requestId: requestId,
      input,
    })
    if (error.code === "INTERNAL_SERVER_ERROR") {
      error.message = `An unexpected error occured. We have been notified. Please try again later. Request ID: ${requestId}`
    }
  },
})
