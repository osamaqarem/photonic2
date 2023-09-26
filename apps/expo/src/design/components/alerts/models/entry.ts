import type { AlertOptionsUnion } from "~/expo/design/components/alerts/models/context"

interface AlertBaseEntry {
  type: "ShowAlert" | "ShowModal" | "ShowError"
  content: React.FC
}

interface ShowAlertEntry extends AlertBaseEntry {
  type: "ShowAlert"
  promiseResolver: (arg?: any) => void
  options: AlertOptionsUnion
}

interface ShowModalEntry extends AlertBaseEntry {
  type: "ShowModal"
  promiseResolver: (arg?: any) => void
  options: AlertOptionsUnion
}

interface ShowErrorEntry extends AlertBaseEntry {
  type: "ShowError"
  promiseResolver: () => void
}

export type AlertEntry = ShowAlertEntry | ShowModalEntry | ShowErrorEntry
