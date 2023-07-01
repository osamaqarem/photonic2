import { PrismaClient } from "@prisma/client"

let db: PrismaClient

declare global {
  var __db__: PrismaClient
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// In production, we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  db = getClient()
} else {
  if (!global.__db__) {
    global.__db__ = getClient()
  }
  db = global.__db__
}

function getClient() {
  const client = new PrismaClient()
  client.$connect()
  return client
}

export { db }
