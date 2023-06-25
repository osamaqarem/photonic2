import Module from "./module"

interface SystemUI {
  setMode: (mode: "light" | "dark" | "system") => Promise<void>
}

export const SystemUI: SystemUI = {
  setMode: Module.setMode,
}
