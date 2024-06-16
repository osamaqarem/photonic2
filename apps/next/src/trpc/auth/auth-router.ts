import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { jwt } from "~/next/lib/jwt"
import { transporter } from "~/next/lib/mail"
import { ApiError } from "~/next/trpc/api-error"
import { publicProcedure, router } from "../trpc"

export const authRouter = router({
  issueLoginCode: publicProcedure
    .input(
      z.object({
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase()

      // random five digits
      const code = Math.floor(Math.random() * 90_000 + 10_000).toString()

      // TODO: check if code exists in db, if it does, reject for 1 minute since issue date
      // TODO: rate limit endpoint

      await Promise.all([
        // TODO: save code to db instead
        ctx.cache.loginCode.set(email, { email, code }),
        transporter.sendMail({
          to: email,
          from: '"Login" <todo@photonic.com>',
          subject: "Log in to Photonic",
          html: `
          <main>
            <h1>Photonic</h1>
            <div style="font-size: 1rem;">Here's your <b>Photonic</b> login code:</div>
            <div style="font-size: 2rem;">${code}</div>
          </main>`,
        }),
      ])

      // TODO: return another random code, codeVerifier.
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
          message: "Invalid or expired code",
        })
      }

      if (email !== cached.email || input.code !== cached.code) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid code",
        })
      }

      ctx.cache.loginCode.delete(email)
      const user = await ctx.db.user.upsert({
        where: { email },
        create: { email },
        update: {},
      })

      return {
        idToken: jwt.idToken.sign(user),
        accessToken: jwt.accessToken.sign(user),
        refreshToken: jwt.refreshToken.sign(user),
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
          message: ApiError.SessionExpired,
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

      return {
        idToken: jwt.idToken.sign(user),
        accessToken: jwt.accessToken.sign(user),
      }
    }),
})
