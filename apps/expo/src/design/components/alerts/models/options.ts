interface StandardLayout {
  type: "Standard"
  icon?: AnyObject
  title: string
  message?: string
  btn: AlertButtons
  dismissOnBackdropPress?: boolean
}

interface CustomLayoutContentProps {
  onDismiss: (arg?: any) => void
}

interface CustomLayout {
  type: "Custom"
  content: (props: CustomLayoutContentProps) => JSX.Element
  btn?: AlertButtons
  dismissOnBackdropPress?: boolean
}

export type AlertOptions = StandardLayout | CustomLayout

export type ModalOptions = AlertOptions & {
  showCloseBtn?: boolean
}

export interface NotificationOptions {
  message: string
  icon?: AnyObject
  dismissAfterMs?: number
}

export interface AlertButtons {
  confirmBtnTitle: string
  cancelBtnTitle?: string
  cancelDestructive?: boolean
  layout?: "row" | "column"
}

export type AlertBtnResult = "confirm" | "cancel" | "backdrop"
