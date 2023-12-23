import type { AwsAccount } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import dayjs from "dayjs"

import type { RoleCredentials } from "~/next/lib/validations/role-cred"
import { ApiError } from "~/next/trpc/api-error"
import { assumeRole } from "~/next/trpc/photo/aws/assume-role"
import { S3 } from "~/next/trpc/photo/aws/s3"
import { authedProcedure, middleware } from "~/next/trpc/trpc"

const storageMiddleware = middleware(async ({ ctx, next }) => {
  if (ctx.user === null) throw new TRPCError({ code: "UNAUTHORIZED" })
  if (!ctx.user.awsAccount) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ApiError.MissingStorageCreds,
    })
  } else {
    const getRoleCreds = async (
      userId: string,
      awsAccount: AwsAccount,
    ): Promise<RoleCredentials> => {
      // Get cached credentials
      const savedCreds = await ctx.cache.awsRoleCred.get(awsAccount)
      if (savedCreds) {
        const { Expiration } = savedCreds
        if (Expiration && !dayjs(Expiration).isBefore(Date.now())) {
          return savedCreds
        }
      }

      // Create new credentials
      try {
        const creds = await assumeRole({
          roleArn: awsAccount.roleArn,
          externalId: userId,
        })
        await ctx.cache.awsRoleCred.set(awsAccount, creds)
        return creds
      } catch (err) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: ApiError.AwsAssumeRoleFailed,
          cause: err,
        })
      }
    }

    let credentials = await getRoleCreds(ctx.user.id, ctx.user.awsAccount)

    const s3 = new S3({
      dev: false,
      bucket: ctx.user.awsAccount.bucketName,
      region: ctx.user.awsAccount.bucketRegion,
      ...credentials,
    })

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        storage: s3,
      },
    })
  }
})

export const storageProcedure = authedProcedure.use(storageMiddleware)
