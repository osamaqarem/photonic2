import ms from "ms"

import { Logger } from "@photonic/common"
import type { AwsAccount, User } from "~/next/lib/db"
import type { RoleCredentials } from "~/next/lib/validations/role-cred"
import { cache as connection } from "./init"

class CacheManager<KeyHolder, Payload> {
  private static logger = new Logger("CacheManager")

  constructor(
    private config: {
      expiresIn: string | ((v: Payload) => string)
      extractKey: (k: KeyHolder) => string
    },
  ) {
    this.config = config
  }

  static async getAndParse<T>(key: string): Promise<Nullable<T>> {
    const string = await connection.get(key).catch(CacheManager.logger.error)
    if (string) return JSON.parse(string) as T
    return null
  }

  static stringifyAndSet<Payload>(
    key: string,
    value: Payload,
    expiryMs: number,
  ) {
    return connection.set(key, JSON.stringify(value), "PX", expiryMs)
  }

  get(key: KeyHolder) {
    const k = this.config.extractKey(key)
    return CacheManager.getAndParse<Payload>(k)
  }

  set(key: KeyHolder, payload: Payload) {
    const expiresIn =
      typeof this.config.expiresIn === "function"
        ? this.config.expiresIn(payload)
        : this.config.expiresIn
    const millis = ms(expiresIn)

    return CacheManager.stringifyAndSet(
      this.config.extractKey(key),
      payload,
      millis,
    )
  }

  async delete(key: string) {
    await connection.del(key).catch(CacheManager.logger.error)
    return
  }
}

export const cache = {
  emailCode: new CacheManager<string, { email: string; code: string }>({
    expiresIn: "10min",
    extractKey: email => email,
  }),
  awsAccount: new CacheManager<User, AwsAccount>({
    expiresIn: "120min",
    extractKey: user => user.id,
  }),
  awsRoleCred: new CacheManager<AwsAccount, RoleCredentials>({
    expiresIn: awsAcc => (awsAcc.Expiration.getTime() - Date.now()).toString(),
    extractKey: awsAcc => awsAcc.roleArn,
  }),
}
