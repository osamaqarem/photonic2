import * as React from "react"
import { StyleSheet } from "react-native"

import { NotificationOptions } from "src/design/components/alerts/models/options"
import { Text } from "../../text"
import { View } from "../../view"

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
