import type { JwtPayload } from "jsonwebtoken"
import jwt from "jsonwebtoken"
import type { UserWithAwsAccount } from "~/lib/db/types"

import { config } from "~/config"

function verify<CustomPayload>(
  token: string,
  secret: string,
): JwtPayload & CustomPayload {
  try {
    const result = jwt.verify(token, secret)
    if (typeof result === "object") {
      return result as JwtPayload & CustomPayload
    }
    throw new Error("result is not a JwtPayload")
  } catch (err) {
    throw new Error("verify", { cause: err })
  }
}

export function isExpired(jwt: JwtPayload): boolean {
  return (jwt.exp ?? 0) * 1000 <= Date.now()
}

const Result = {
  ok: <T extends JwtPayload>(payload: T) => [payload, null] as const,
  error: (error: Error) => [null, error] as const,
}

interface JwtHandler<T extends JwtPayload> {
  secret: string
  sign: (...args: any[]) => string
  verify: (
    ...args: any[]
  ) => ReturnType<typeof Result.ok<T> | typeof Result.error>
}

export const emailToken: JwtHandler<{ email: string }> = {
  secret: config.EMAIL_SECRET,
  sign(email: string) {
    return jwt.sign({ email }, this.secret, { expiresIn: "10 min" })
  },
  verify(emailToken: string) {
    try {
      const token = verify<{ email: string }>(emailToken, this.secret)
      return Result.ok(token)
    } catch (err) {
      return Result.error(new Error("emailToken -> verify", { cause: err }))
    }
  },
}

interface RandomCodePayload {
  email: string
  code: string
}
export const randomCodeToken: JwtHandler<RandomCodePayload> = {
  secret: config.CODE_SECRET,
  sign(payload: RandomCodePayload) {
    return jwt.sign(payload, this.secret, { expiresIn: "10 min" })
  },
  verify(codeToken: string) {
    try {
      const token = verify<RandomCodePayload>(codeToken, this.secret)
      return Result.ok(token)
    } catch (err) {
      return Result.error(
        new Error("randomCodeToken -> verify", { cause: err }),
      )
    }
  },
}

export const refreshToken: JwtHandler<UserWithAwsAccount> = {
  secret: config.REFRESH_TOKEN_SECRET,
  sign(user: UserWithAwsAccount) {
    return jwt.sign(user, this.secret, { expiresIn: "30 days" })
  },
  verify(refreshToken: string) {
    try {
      const token = verify<UserWithAwsAccount>(refreshToken, this.secret)
      return Result.ok(token)
    } catch (err) {
      return Result.error(new Error("refreshToken -> verify", { cause: err }))
    }
  },
}

export const accessToken: JwtHandler<UserWithAwsAccount> = {
  secret: config.ACCESS_TOKEN_SECRET,
  sign(user: UserWithAwsAccount) {
    return jwt.sign(user, this.secret, { expiresIn: "60min" })
  },
  verify(accessToken: string) {
    try {
      const token = verify<UserWithAwsAccount>(accessToken, this.secret)
      return Result.ok(token)
    } catch (err) {
      return Result.error(new Error("accessToken -> verify", { cause: err }))
    }
  },
}
