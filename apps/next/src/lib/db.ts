import { PrismaClient } from "@prisma/client"

declare const global: {
  prisma: PrismaClient | undefined
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  })

if (process.env.NODE_ENV !== "production") global.prisma = db

export * from "@prisma/client"
