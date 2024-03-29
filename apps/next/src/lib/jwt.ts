import type { User } from "@prisma/client"
import type { JwtPayload, SignOptions } from "jsonwebtoken"
import jsonwebtoken from "jsonwebtoken"

import { config } from "~/next/config"

interface Config<Payload> extends Omit<SignOptions, "subject"> {
  subject?: (p: Payload) => string
}

class JwtManager<Payload extends JwtPayload> {
  static Result = {
    ok: <T extends JwtPayload>(payload: T) => [payload, null] as const,
    error: (error: Error) => [null, error] as const,
  }

  constructor(private config: Config<Payload>, private secret: string) {}

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
    const subject = this.config.subject?.(payload)

    const { subject: _, ...rest } = this.config
    const options: SignOptions = {
      ...rest,
      ...(subject ? { subject } : {}),
    }
    return jsonwebtoken.sign(payload, this.secret, options)
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
  emailToken: new JwtManager<{ email: string }>(
    {
      expiresIn: "10 min",
    },
    config.EMAIL_SECRET,
  ),
  refreshToken: new JwtManager<User>(
    {
      expiresIn: "30 days",
    },
    config.REFRESH_TOKEN_SECRET,
  ),
  accessToken: new JwtManager<User>(
    {
      expiresIn: "60 min",
      subject: payload => payload.id,
    },
    config.ACCESS_TOKEN_SECRET,
  ),
}
