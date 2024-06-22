import type { User } from "@prisma/client"
import type { JwtPayload, SignOptions } from "jsonwebtoken"
import jsonwebtoken from "jsonwebtoken"

import { config } from "~/next/config"

class JwtManager<PayloadSource extends Record<string, any>, Payload> {
  static Result = {
    ok: <T extends JwtPayload>(payload: T) => [payload, null] as const,
    error: (error: Error) => [null, error] as const,
  }

  constructor(
    private buildPayload: (payload: PayloadSource) => Payload,
    private buildClaims: SignOptions | ((p: PayloadSource) => SignOptions),
    private secret: string,
  ) {}

  static verify<CustomPayload>(
    token: string,
    secret: string,
  ): JwtPayload & CustomPayload {
    try {
      const result = jsonwebtoken.verify(token, secret)
      if (typeof result === "object") {
        return result as JwtPayload & CustomPayload
      }
      throw new Error("result is not a JwtPayload")
    } catch (err) {
      throw new Error("verify", { cause: err })
    }
  }

  sign(basePayload: PayloadSource) {
    const signingOptions =
      typeof this.buildClaims === "function"
        ? this.buildClaims(basePayload)
        : this.buildClaims
    const payload = this.buildPayload?.(basePayload) ?? basePayload
    return jsonwebtoken.sign(payload, this.secret, signingOptions)
  }

  verify(token: string) {
    try {
      const res = JwtManager.verify<Payload>(token, this.secret)
      return JwtManager.Result.ok(res)
    } catch (err) {
      return JwtManager.Result.error(
        new Error("createJwtHandler -> verify", { cause: err }),
      )
    }
  }
}

export const jwt = {
  isExpired(jwt: JwtPayload): boolean {
    return (jwt.exp ?? 0) * 1000 <= Date.now()
  },
  refreshToken: new JwtManager<User, { id: string }>(
    user => ({ id: user.id }),
    {
      expiresIn: "30 days",
    },
    config.AUTH_SECRET,
  ),
  accessToken: new JwtManager<User, { id: string }>(
    user => ({ id: user.id }),
    {
      expiresIn: "60 min",
    },
    config.AUTH_SECRET,
  ),
  idToken: new JwtManager<
    User,
    {
      id: string
      awsAccountId: Nullable<string>
      email: string
    }
  >(
    user => ({
      awsAccountId: user.awsAccountId,
      email: user.email,
      id: user.id,
    }),
    user => ({
      expiresIn: "60 min",
      subject: user.id,
    }),
    config.AUTH_SECRET,
  ),
}
