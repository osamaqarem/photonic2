import { useContext } from "react"

import {
  alertsContext,
  AlertsStatic,
} from "~/expo/design/components/alerts/AlertsContext"
import type { AlertsContext } from "~/expo/design/components/alerts/models/context"

export function useAlerts(): AlertsContext {
  const alerts = useContext(alertsContext)

  if (!alerts) {
    throw new Error("useAlerts must be used within AlertsProvider")
  }

  return alerts
}

useAlerts.get = () => AlertsStatic
