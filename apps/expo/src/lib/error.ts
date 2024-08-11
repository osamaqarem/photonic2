import { getErrorMsg } from "@photonic/common"
import * as Sentry from "@sentry/react-native"
import { alertsEmitter } from "~/expo/design/components/alerts/AlertsContext"

export function handleError({
  error,
  message,
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
    return message
  })()
  alertsEmitter.emit("showError", actualMessage)
}
