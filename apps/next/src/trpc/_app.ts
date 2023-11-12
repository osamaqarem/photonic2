import { router } from "./trpc"
import { authRouter } from "./auth/auth-router"
import { photoRouter } from "./photo/photo-router"
import { userRouter } from "./user/user-router"

export const appRouter = router({
  auth: authRouter,
  photo: photoRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
