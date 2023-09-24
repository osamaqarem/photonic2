import { z } from "zod"

export type RoleCredentials = z.infer<typeof RoleCredentialsSchema>

export const RoleCredentialsSchema = z.object({
  AccessKeyId: z.string(),
  SecretAccessKey: z.string(),
  SessionToken: z.string(),
  Expiration: z.date(),
})
