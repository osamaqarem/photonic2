import * as React from "react"
import { DarkModeContext } from "./dark-mode"

export const useDarkMode = () => {
  const themeContext = React.useContext(DarkModeContext)

  if (!themeContext) {
    throw new Error("DarkModeContext must be used within a DarkModeContext.Provider")
  }

  return themeContext
}
