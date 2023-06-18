import Constants from "expo-constants"
import { Platform } from "react-native"
import { z } from "zod"

const nonempty = z.string().trim().min(1)

const schema = z.object({
  STAGE: z.enum(["development", "staging", "production"]).catch("development"),
  DOMAIN: nonempty.catch("http://localhost:3000"), //DevSkim: ignore DS137138)
  SENTRY_DSN: nonempty,
  STORYBOOK: z.boolean(),
})

export const config = schema.parse(
  Platform.OS === "web"
    ? {
        STAGE: process.env.NEXT_PUBLIC_STAGE,
        DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        STORYBOOK: Boolean(process.env.NEXT_PUBLIC_STORYBOOK),
      }
    : Constants.manifest?.extra,
)
