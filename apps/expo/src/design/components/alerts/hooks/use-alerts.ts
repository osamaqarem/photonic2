import { useContext } from "react"

import {
  Alerts,
  AlertsContext,
} from "src/design/components/alerts/alerts-context"
import type { AlertsContextType } from "src/design/components/alerts/models/context"

export function useAlerts(): AlertsContextType {
  const alerts = useContext(AlertsContext)

  if (!alerts) {
    throw new Error("useAlerts must be used within AlertsProvider")
  }

  return alerts
}

useAlerts.get = () => Alerts
