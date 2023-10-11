import * as React from "react"
import { StyleSheet, View } from "react-native"

import type { NotificationOptions } from "~/expo/design/components/alerts/models/options"
import { Icon } from "~/expo/design/components/icons/Icons"
import { Text } from "~/expo/design/components/Text"

interface Props extends NotificationOptions {
  handleDismiss: () => void
}

export const NotificationView: React.FC<Props> = ({
  icon,
  message,
  dismissAfterMs,
  handleDismiss,
}) => {
  React.useEffect(() => {
    setTimeout(handleDismiss, dismissAfterMs ?? 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.content}>
      {icon ? <Icon name={icon} style={styles.iconStyle} /> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  iconStyle: {
    height: 80,
    width: 80,
  },
  content: {
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
})
