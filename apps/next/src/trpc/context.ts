import type * as trpc from "@trpc/server"
import type * as trpcNext from "@trpc/server/adapters/next"

import { cache } from "~/next/lib/cache"
import { db } from "~/next/lib/db"
import { jwt } from "~/next/lib/jwt"

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  function getUserFromHeader() {
    if (req.headers.authorization) {
      const accessToken = req.headers.authorization?.split(" ")[1]
      if (accessToken) {
        const [user] = jwt.accessToken.verify(accessToken)
        if (!user) return null
        return user
      }
    }
    return null
  }

  return {
    req,
    res,
    db,
    cache,
    user: getUserFromHeader(),
  }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
