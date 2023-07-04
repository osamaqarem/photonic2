import { useContext } from "react"

import { Alerts, AlertsContext } from "~/design/components/alerts/AlertsContext"
import type { AlertsContextType } from "~/design/components/alerts/models/context"

export function useAlerts(): AlertsContextType {
  const alerts = useContext(AlertsContext)

  if (!alerts) {
    throw new Error("useAlerts must be used within AlertsProvider")
  }

  return alerts
}

useAlerts.get = () => Alerts
