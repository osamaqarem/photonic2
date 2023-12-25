import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { jwt } from "~/next/lib/jwt"
import { transporter } from "~/next/lib/mail"
import { ApiError } from "~/next/trpc/api-error"
import { publicProcedure, router } from "../trpc"

export const authRouter = router({
  getLoginCode: publicProcedure
    .input(
      z.object({
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase()

      // random six digits
      const code = Math.floor(Math.random() * 90_000 + 10_000).toString()

      await Promise.all([
        ctx.cache.loginCode.set(email, { email, code }),
        transporter.sendMail({
          to: email,
          from: '"Login" <todo@photonic.com>',
          subject: "Log in to Photonic",
          html: `<main><h1>Photonic App</h1><div>Here's your <b>Photonic</b> login code:<br/>${code}</div></main>`,
        }),
      ])

      return
    }),
  verifyLoginCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase()

      const cached = await ctx.cache.loginCode.get(email)
      if (!cached) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid code",
        })
      }

      if (email !== cached.email || input.code !== cached.code) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid code",
        })
      }

      const user = await ctx.db.user.upsert({
        where: { email },
        create: { email },
        update: {},
      })

      return {
        accessToken: jwt.accessToken.sign(user),
        refreshToken: jwt.refreshToken.sign(user),
        onboardingDone: Boolean(user.awsAccountId),
      }
    }),
  refresh: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { refreshToken } = input

      let [refreshTokenJwt, error] = jwt.refreshToken.verify(refreshToken)
      if (!refreshTokenJwt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error?.message ?? "Invalid token",
          cause: error,
        })
      }

      if (jwt.isExpired(refreshTokenJwt)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: ApiError.InvalidRefreshToken,
        })
      }

      const user = await ctx.db.user.findFirst({
        where: { id: refreshTokenJwt.id },
      })

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        })
      }

      return jwt.accessToken.sign(user)
    }),
})
