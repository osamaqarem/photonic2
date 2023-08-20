import type {
  AlertBtnResult,
  AlertButtons,
  AlertOptions,
  ModalOptions,
  NotificationOptions,
} from "~/design/components/alerts/models/options"

export interface AlertsContextType {
  showError: {
    (message: string): Promise<void>
    handle(err: unknown): Promise<void>
  }
  showAlert: ShowAPI<AlertOptions>
  showModal: ShowAPI<ModalOptions>
  showNotification: (options: NotificationOptions) => Promise<void>
  isPresenting: boolean
}

export type AlertOptionsUnion =
  | Parameters<AlertsContextType["showAlert"]>[number]
  | Parameters<AlertsContextType["showModal"]>[number]

// If you pass `btn`, you get back `Promise<AlertBtnResult>`
// If `btn` is not passed, you get back `Promise<any>`
type ShowAPI<OptionsType extends AlertOptions> = <Options extends OptionsType>(
  opt: Options,
) => Promise<Options["btn"] extends AlertButtons ? AlertBtnResult : any>
