import * as React from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"

import { Button } from "~/expo/design/components/Button"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { Icon } from "~/expo/design/components/icons/Icons"
import { theme } from "~/expo/design/theme"

interface Props<Data> {
  children: React.ReactNode | ((d: Data) => React.ReactNode)
  loading?: boolean
  data?: Data
  error?: string
  retry?: () => void
}

export const AppState = <Data,>({
  children,
  data,
  error,
  loading,
  retry,
}: Props<Data>) => {
  if (loading || !data)
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} />
      </View>
    )

  if (error) {
    return (
      <>
        <ScrollView contentContainerStyle={styles.container}>
          <Icon name="Cpu" style={styles.icon} />
          <Space t={24} />
          <Text variant="h1">Something went wrong</Text>
          <Space t={24} />
          <Text variant="span">{error}</Text>
        </ScrollView>
        {retry && (
          <ScrollView.StickyView>
            <Button text="Retry" size="default" onPress={retry} />
          </ScrollView.StickyView>
        )}
      </>
    )
  }

  return <>{typeof children === "function" ? children(data) : children}</>
}

const styles = StyleSheet.create({
  icon: {
    height: 120,
    width: 120,
    color: theme.colors.error,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
