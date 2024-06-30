import { getErrorMsg } from "@photonic/common"
import * as Sentry from "@sentry/react-native"
import { alertsEmitter } from "~/expo/design/components/alerts/AlertsContext"

export function handleError({
  error,
  message,
  extendMessage = true,
  transactionName,
}: {
  error: unknown
  message?: string
  transactionName?: string
  extendMessage?: boolean
}) {
  Sentry.getCurrentScope().setTransactionName(transactionName)
  Sentry.captureException(error)
  const actualMessage = (() => {
    if (!message) {
      return getErrorMsg(error)
    }
    if (extendMessage) {
      return `${message} If your connection is fine this might be a problem on our side. Please contact us if the issue persists.`
    }
    return message
  })()
  alertsEmitter.emit("showError", actualMessage)
}
