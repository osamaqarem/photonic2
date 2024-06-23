import { drizzle } from "drizzle-orm/expo-sqlite"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { openDatabaseSync } from "expo-sqlite/next"

const expo = openDatabaseSync("db.db")
export const db = drizzle(expo, { logger: __DEV__ })

export const useDbStudio = () => {
  return useDrizzleStudio(expo)
}
