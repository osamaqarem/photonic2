import { router } from "./trpc"
import { authRouter } from "./auth/auth-router"
import { photoRouter } from "./photo/photo-router"

export const appRouter = router({
  auth: authRouter,
  photo: photoRouter,
})

export type AppRouter = typeof appRouter
