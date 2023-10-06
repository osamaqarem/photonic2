import type {
  BaseOptions,
  AlertBtnResult,
  ModalOptions,
} from "~/expo/design/components/alerts/models/options"

interface AlertBaseEntry {
  type: "ShowAlert" | "ShowModal" | "ShowError"
  content: React.FC
}

interface ShowAlertEntry extends AlertBaseEntry {
  type: "ShowAlert"
  promiseResolver: (result: AlertBtnResult) => void
  options: BaseOptions
}

interface ShowModalEntry extends AlertBaseEntry {
  type: "ShowModal"
  promiseResolver: (result: AlertBtnResult) => void
  options: ModalOptions
}

interface ShowErrorEntry extends AlertBaseEntry {
  type: "ShowError"
  promiseResolver: () => void
}

export type AlertEntry = ShowAlertEntry | ShowModalEntry | ShowErrorEntry
