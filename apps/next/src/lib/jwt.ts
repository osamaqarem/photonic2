import type { JwtPayload, SignOptions } from "jsonwebtoken"
import jsonwebtoken from "jsonwebtoken"

import type { UserJoinAwsAccount } from "~/next/lib/db/types"
import { config } from "~/next/config"

class JwtManager<Payload extends JwtPayload> {
  static Result = {
    ok: <T extends JwtPayload>(payload: T) => [payload, null] as const,
    error: (error: Error) => [null, error] as const,
  }

  constructor(
    private config: {
      secret: string
      expiresIn?: SignOptions["expiresIn"]
    },
  ) {
    this.config = config
  }

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

  sign(payload: Payload) {
    return jsonwebtoken.sign(payload, this.config.secret, {
      expiresIn: this.config.expiresIn,
    })
  }

  verify(token: string) {
    try {
      const res = JwtManager.verify<Payload>(token, this.config.secret)
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
  emailToken: new JwtManager<{ email: string }>({
    secret: config.EMAIL_SECRET,
    expiresIn: "10 min",
  }),
  refreshToken: new JwtManager<UserJoinAwsAccount>({
    secret: config.REFRESH_TOKEN_SECRET,
    expiresIn: "30 days",
  }),
  accessToken: new JwtManager<UserJoinAwsAccount>({
    secret: config.ACCESS_TOKEN_SECRET,
    expiresIn: "60 min",
  }),
}
