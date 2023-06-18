import Module from "./module"

interface SystemUI {
  setDark: () => Promise<void>
  setLight: () => Promise<void>
  setSystem: () => Promise<void>
}

export const SystemUI: SystemUI = {
  setDark: Module.setDark,
  setLight: Module.setLight,
  setSystem: Module.setSystem,
}
