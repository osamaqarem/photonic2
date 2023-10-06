import type {
  AlertBtnResult,
  BaseOptions,
  ModalOptions,
  NotificationOptions,
} from "~/expo/design/components/alerts/models/options"

export interface AlertsContextType {
  showAlert: (opt: BaseOptions) => Promise<AlertBtnResult>
  showModal: (opt: ModalOptions) => Promise<AlertBtnResult>
  showError: (message: string) => Promise<void>
  showNotification: (options: NotificationOptions) => Promise<void>
}
