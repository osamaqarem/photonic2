import { drizzle } from "drizzle-orm/expo-sqlite"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { openDatabaseSync } from "expo-sqlite/next"

const expo = openDatabaseSync("db.db")
export const db = drizzle(expo, { logger: __DEV__ })

export const useDbStudio = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (__DEV__) useDrizzleStudio(expo)
}
