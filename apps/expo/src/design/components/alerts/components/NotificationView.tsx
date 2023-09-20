import * as React from "react"
import { StyleSheet, View } from "react-native"

import type { NotificationOptions } from "~/design/components/alerts/models/options"
import { Text } from "~/design/components/Text"

interface Props extends NotificationOptions {
  onDismiss: () => void
}

export const NotificationView: React.FC<Props> = ({
  icon,
  message,
  dismissAfterMs,
  onDismiss,
}) => {
  React.useEffect(() => {
    setTimeout(onDismiss, dismissAfterMs ?? 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.content}>
      {icon ? "icon" : null}
      <Text style={[styles.message]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 24,
  },
})
