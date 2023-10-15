import type {
  AlertBtnResult,
  BaseOptions,
  ModalOptions,
  NotificationOptions,
} from "~/expo/design/components/alerts/models/options"

export interface AlertsContext {
  showAlert: (opt: BaseOptions) => Promise<AlertBtnResult>
  showModal: (opt: ModalOptions) => Promise<AlertBtnResult>
  showError: (message: string) => Promise<void>
  showNotification: (options: NotificationOptions) => Promise<void>
}
