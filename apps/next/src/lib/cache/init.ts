import Redis from "ioredis"

import { config } from "~/next/config"

declare const global: {
  redisClient: Redis | undefined
}

export const cache = global.redisClient || new Redis(config.REDIS_URL)

if (process.env.NODE_ENV !== "production") global.redisClient = cache
