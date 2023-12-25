import RNConfig from "react-native-config"
import { z } from "zod"

const env = z
  .object({
    STAGE: z
      .enum(["development", "storybook", "production"])
      .catch("development"),
  })
  .parse(RNConfig)

const ApiConfig: Record<(typeof env)["STAGE"], string> = {
  development: "http://localhost:3000",
  production: "https://photonic-next.fly.dev",
  storybook: "Sir, this is a Storybook.",
}

export const config = {
  stage: env.STAGE,
  apiBaseUrl: ApiConfig[env.STAGE],
  sentryDsn:
    "https://b9884c9f02df411987bbebfd332eb35f@o1418518.ingest.sentry.io/6761728",
}
