import ms from "ms"

import { Logger } from "@photonic/common"
import type { AwsAccount, User } from "~/lib/db"
import type { RoleCredentials } from "~/lib/validations/role-cred"
import { cache } from "./init"

const logger = new Logger("redis")

async function getAndParse<T>(key: string): Promise<Nullable<T>> {
  const string = await cache.get(key).catch(logger.error)
  if (string) return JSON.parse(string) as T
  return null
}

function stringifyAndSet(key: string, value: AnyObject, expiryMs: number) {
  return cache.set(key, JSON.stringify(value), "PX", expiryMs)
}

export const awsRepo = {
  getAccountForUser(user: User): Promise<Nullable<AwsAccount>> {
    return getAndParse<AwsAccount>(user.id)
  },
  setAccountForUser(user: User, awsAccount: AwsAccount) {
    return stringifyAndSet(user.id, awsAccount, ms("120min"))
  },
  async removeAccountForUser(user: User): Promise<void> {
    await cache.del(user.id).catch(logger.error)
    return
  },
  getRoleCredForAccount(
    awsAccount: AwsAccount,
  ): Promise<Nullable<RoleCredentials>> {
    return getAndParse<RoleCredentials>(awsAccount.roleArn)
  },
  setRoleCredsForAccount(awsAccount: AwsAccount, creds: RoleCredentials) {
    return stringifyAndSet(
      awsAccount.roleArn,
      creds,
      creds.Expiration.getTime() - Date.now(),
    )
  },
}
