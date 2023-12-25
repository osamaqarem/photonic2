import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { Linking, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppState } from "~/expo/design/components/AppState"

import { Button } from "~/expo/design/components/Button"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { theme } from "~/expo/design/theme"
import type { AppParams } from "~/expo/navigation/params"
import { trpc } from "~/expo/stores/TrpcProvider"
import { useAuth } from "~/expo/stores/auth-store"

// Reference
// https://github.com/software-mansion/react-native-screens/blob/b9471bebe70d83c71740c5a308af9ea7ad377821/native-stack/README.md#measuring-headers-height-on-ios
const NavHeaderHeight = 44

export const SettingsScreen: React.FC<
  NativeStackScreenProps<AppParams, "settings">
> = () => {
  const { top: topInset } = useSafeAreaInsets()
  const safeTop = topInset + NavHeaderHeight

  const signOut = useAuth(s => s.actions.setSignedOut)

  const { data, isLoading, error, refetch } = trpc.user.profile.useQuery()

  const handleSignOut = () => {
    signOut()
  }

  const handleAWSAuth = async (url: string) => {
    // show AWS in app browser
    await Linking.openURL(url)
  }

  return (
    <AppState
      data={data}
      loading={isLoading}
      error={error?.message}
      retry={refetch}>
      {safeData => (
        <>
          <ScrollView style={styles.scroll}>
            <View style={[styles.safe, { top: safeTop }]}>
              {
                <Button
                  style={{
                    alignSelf: "center",
                    marginTop: 50,
                  }}
                  text={
                    safeData.aws.status === "unavailable"
                      ? "Connect AWS Account"
                      : "Disconnect AWS Account"
                  }
                  size="widest"
                  variant="secondary"
                  onPress={() => handleAWSAuth(safeData.aws.toggleUrl)}
                />
              }
            </View>
          </ScrollView>
          <ScrollView.StickyView style={styles.stickyView}>
            <Button text="Logout" size="widest" onPress={handleSignOut} />
          </ScrollView.StickyView>
        </>
      )}
    </AppState>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  stickyView: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: theme.space.scale[20],
  },
  scroll: {
    paddingHorizontal: 0,
    flexGrow: 1,
  },
})
