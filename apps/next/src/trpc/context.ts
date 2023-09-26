import type * as trpc from "@trpc/server"
import type * as trpcNext from "@trpc/server/adapters/next"

import type { User } from "~/next/lib/db"
import { db } from "~/next/lib/db"
import type { UserWithAwsAccount } from "~/next/lib/db/types"
import * as redis from "~/next/lib/cache"
import * as jwt from "~/next/lib/jwt"

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  async function getUserFromHeader(): Promise<Nullable<User>> {
    const withAwsAccount = async (user: UserWithAwsAccount) => {
      if (user.awsAccount) return user
      // When the cloudformation is initially created, the user's access token won't contain the AWS account. until the user refreshes their token, their AWS account is cached on redis.
      const awsAccount = await redis.awsRepo.getAccountForUser(user)
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
    redis,
    user,
  }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
