import Redis from "ioredis"

import { config } from "~/config"

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined
}

export const cache = global.redisClient || new Redis(config.REDIS_URL)

if (process.env.NODE_ENV !== "production") global.redisClient = cache
