import Redis from "ioredis"

let cache: Redis

declare global {
  // eslint-disable-next-line no-var
  var __cache__: Redis
}

if (process.env.NODE_ENV === "production") {
  cache = new Redis(process.env.REDIS_URL!)
} else {
  if (!global.__cache__) {
    global.__cache__ = new Redis(process.env.REDIS_URL!)
  }
  cache = global.__cache__
}

export { cache }
