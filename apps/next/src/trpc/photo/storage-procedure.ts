import type { AwsBucket } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import dayjs from "dayjs"
import { db } from "~/next/lib/db"

import type { RoleCredentials } from "~/next/lib/validations/role-cred"
import { ApiError } from "~/next/trpc/api-error"
import { assumeRole } from "~/next/trpc/photo/aws/assume-role"
import { S3 } from "~/next/trpc/photo/aws/s3"
import { authedProcedure, middleware } from "~/next/trpc/trpc"

const storageMiddleware = middleware(async ({ ctx, next }) => {
  if (ctx.user === null) throw new TRPCError({ code: "UNAUTHORIZED" })
  else {
    const getRoleCreds = async (
      bucket: AwsBucket,
    ): Promise<RoleCredentials> => {
      // Get cached credentials
      const savedCreds = await ctx.cache.awsRoleCred.get(bucket)
      if (savedCreds) {
        const { Expiration } = savedCreds
        if (Expiration && !dayjs(Expiration).isBefore(Date.now())) {
          return savedCreds
        }
      }

      // Create new credentials
      try {
        const creds = await assumeRole({
          roleArn: bucket.roleArn,
          externalId: bucket.userId,
        })
        await ctx.cache.awsRoleCred.set(bucket, creds)
        return creds
      } catch (err) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: ApiError.AwsAssumeRoleFailed,
          cause: err,
        })
      }
    }

    const bucket = await db.awsBucket.findFirstOrThrow({
      where: { userId: ctx.user.id },
    })
    let credentials = await getRoleCreds(bucket)

    const s3 = new S3({
      dev: false,
      bucket: bucket.name,
      region: bucket.region,
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
