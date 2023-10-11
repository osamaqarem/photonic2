import type * as trpc from "@trpc/server"
import type * as trpcNext from "@trpc/server/adapters/next"

import { db } from "~/next/lib/db"
import type { UserJoinAwsAccount } from "~/next/lib/db/types"
import { cache } from "~/next/lib/cache"
import { jwt } from "~/next/lib/jwt"

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  async function getUserFromHeader(): Promise<Nullable<UserJoinAwsAccount>> {
    const withAwsAccount = async (user: UserJoinAwsAccount) => {
      if (user.awsAccount) return user
      // When the cloudformation is initially created, the user's access token won't contain the AWS account. until the user refreshes their token, their AWS account is cached on redis.
      const awsAccount = await cache.awsAccount.get(user)
      if (!awsAccount) return user
      return {
        ...user,
        awsAccount,
      }
    }

    if (req.headers.authorization) {
      const accessToken = req.headers.authorization?.split(" ")[1]
      if (accessToken) {
        const [user] = jwt.accessToken.verify(accessToken)
        if (!user) return null
        return await withAwsAccount(user)
      }
    }
    return null
  }

  let user = await getUserFromHeader()

  return {
    req,
    res,
    db,
    cache,
    user,
  }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
