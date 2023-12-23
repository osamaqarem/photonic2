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
})

const parsedEnv = schema.parse(process.env)

export const config = {
  ...parsedEnv,
  AWS_CFN_URL:
    "https://eu-central-1.console.aws.amazon.com/cloudformation/home",
  AWS_CFN_TEMPLATE_URL: `https://photonic-cloudformation-templates-${parsedEnv.PHOTONIC_AWS_REGION}.s3.${parsedEnv.PHOTONIC_AWS_REGION}.amazonaws.com`,
}
