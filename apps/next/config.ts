import { z } from "zod"

const nonempty = z.string().trim().min(1)

const schema = z.object({
  STAGE: z.enum(["development", "staging", "production"]).catch("development"),
  DOMAIN: nonempty.catch("http://localhost:3000"), //DevSkim: ignore DS137138)
  MAIL_USER: nonempty,
  MAIL_PASS: nonempty,
  EMAIL_SECRET: nonempty,
  CODE_SECRET: nonempty,
  ACCESS_TOKEN_SECRET: nonempty,
  REFRESH_TOKEN_SECRET: nonempty,
  DATABASE_URL: nonempty,
  REDIS_URL: nonempty,
  PHOTONIC_AWS_SECRET_KEY: nonempty,
  PHOTONIC_AWS_ACCESS_KEY_ID: nonempty,
  PHOTONIC_AWS_REGION: nonempty,
  AWS_CFN_URL: nonempty,
  AWS_CFN_TEMPLATE_URL: nonempty,
})

export const config = schema.parse(process.env)
