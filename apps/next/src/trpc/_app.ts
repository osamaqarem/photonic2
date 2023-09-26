import { publicProcedure, router } from "./trpc"
// import { authRouter } from "./auth/auth-router"

export const appRouter = router({
  auth: publicProcedure.query(() => {
    return { message: "Hello world" }
  }),
})

export type AppRouter = typeof appRouter
