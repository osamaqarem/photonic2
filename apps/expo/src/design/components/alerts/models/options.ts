import type { Icons } from "~/expo/design/components/icons/Icons"

interface StandardLayout {
  type: "Standard"
  title: string
  btn: AlertButtons
  message?: string
  icon?: Icons
  dismissOnBackdropPress?: boolean
}

interface CustomLayout {
  type: "Custom"
  content: React.FC<CustomContentProps>
  btn?: AlertButtons
  dismissOnBackdropPress?: boolean
}

interface CustomContentProps {
  dismiss: (result: AlertBtnResult) => void
}

export type BaseOptions = StandardLayout | CustomLayout

export type ModalOptions = BaseOptions & {
  // TODO: not implemented
  showCloseBtn?: boolean
}

export interface NotificationOptions {
  message: string
  icon?: Icons
  dismissAfterMs?: number
}

export interface AlertButtons {
  confirmBtnTitle: string
  cancelBtnTitle?: string
  cancelDestructive?: boolean
  layout?: "row" | "column"
}

export type AlertBtnResult =
  | "confirm"
  | "cancel"
  | "backdrop"
  | "timeout"
  | undefined
