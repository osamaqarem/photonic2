import { useContext } from "react"

import {
  AlertsContext,
  AlertsStatic,
} from "~/expo/design/components/alerts/AlertsContext"
import type { AlertsContextType } from "~/expo/design/components/alerts/models/context"

export function useAlerts(): AlertsContextType {
  const alerts = useContext(AlertsContext)

  if (!alerts) {
    throw new Error("useAlerts must be used within AlertsProvider")
  }

  return alerts
}

useAlerts.get = () => AlertsStatic
