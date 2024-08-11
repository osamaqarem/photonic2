import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { Linking, StyleSheet, View } from "react-native"
import { AppState } from "~/expo/design/components/AppState"

import { Button } from "~/expo/design/components/Button"
import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { palette } from "~/expo/design/palette"
import { theme } from "~/expo/design/theme"
import type { AppParams } from "~/expo/navigation/params"
import { trpc } from "~/expo/state/TrpcProvider"
import { useAuth } from "~/expo/state/auth-store"

export const OnboardingStorageScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-storage">
> = props => {
  const finishOnboarding = useAuth(s => s.actions.finishOnboarding)

  const { data, isLoading, error, refetch } = trpc.user.profile.useQuery()

  React.useEffect(() => {
    if (data?.aws.status === "connected") {
      finishOnboarding()
    }
  }, [data?.aws.status])

  const handleAWSAuth = async (url: string) => {
    // show AWS in app browser
    await Linking.openURL(url)
    props.navigation.navigate("onboarding-permissions")
  }

  return (
    <AppState
      data={data}
      loading={isLoading}
      error={error?.message}
      retry={refetch}>
      {safeData => (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <SafeAreaView style={styles.safe} top>
              <Text variant="h2">Photonic</Text>
              <Space t={80} />
              <Text variant="h1">Let’s create your storage.</Text>
              <Space t={30} />
              <Text variant="p">
                To enable backups, login to your AWS account, press ‘create’ and
                then give us a moment.
              </Text>
              <Space t={30} />
              <View style={styles.video} />
            </SafeAreaView>
          </ScrollView>
          <ScrollView.StickyView style={styles.stickyView}>
            <Button
              text="Skip"
              size="small"
              variant="secondary"
              onPress={finishOnboarding}
            />
            <Button
              text="Connect to AWS"
              size="wide"
              onPress={() => handleAWSAuth(safeData.aws.toggleUrl)}
            />
          </ScrollView.StickyView>
        </>
      )}
    </AppState>
  )
}

const styles = StyleSheet.create({
  video: {
    backgroundColor: palette.light.slate.slate6,
    width: "100%",
    height: "30%",
    borderRadius: 20,
  },
  stickyView: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: theme.space.scale[20],
  },
  scroll: { flexGrow: 1 },
  safe: {
    flex: 1,
  },
})
