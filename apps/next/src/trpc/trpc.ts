import * as trpc from "@trpc/server"
import { initTRPC } from "@trpc/server"

import type { Context } from "./context"
import { ApiError } from "./api-error"

const t = initTRPC.context<Context>().create()

const isAuthedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: ApiError.InvalidAccessToken,
    })
  } else {
    return next({
      ctx: {
        ...ctx,
        // infers that `user` is non-nullable to downstream procedures
        user: ctx.user,
      },
    })
  }
})

export const authedProcedure = t.procedure.use(isAuthedMiddleware)

// Easier to go to references/definitions when not exporting/destructuring at the same time
export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
export const mergeRouters = t.mergeRouters
