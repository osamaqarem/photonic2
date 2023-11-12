import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet, View } from "react-native"

import { Button } from "~/expo/design/components/Button"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { theme } from "~/expo/design/theme"
import type { AppParams } from "~/expo/navigation/params"
import { useAuth } from "~/expo/stores/auth-store"

export const SettingsScreen: React.FC<
  NativeStackScreenProps<AppParams, "settings">
> = () => {
  const signOut = useAuth(s => s.actions.setSignedOut)

  const handleSignOut = () => {
    signOut()
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      />
      <ScrollView.StickyView style={styles.stickyView}>
        <Button text="Logout" size="widest" onPress={handleSignOut} />
      </ScrollView.StickyView>
    </View>
  )
}

const styles = StyleSheet.create({
  stickyView: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: theme.space.scale[20],
  },
  scroll: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  root: {
    flex: 1,
  },
})
