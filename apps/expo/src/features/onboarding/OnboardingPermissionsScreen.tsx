import React from "react"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { PermissionStatus, usePermissions } from "expo-media-library"
import { View, ActivityIndicator, Linking, StyleSheet } from "react-native"

import { Button } from "~/expo/design/components/Button"
import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { theme } from "~/expo/design/theme"
import type { AppParams } from "~/expo/navigation/params"
import { useAuth } from "~/expo/stores/auth-store"

export const OnboardingPermissionsScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-permissions">
> = () => {
  const [permissionResponse, requestPermission] = usePermissions()

  const finishOnboarding = useAuth(s => s.actions.finishOnboarding)

  React.useEffect(() => {
    if (permissionResponse?.status === PermissionStatus.GRANTED) {
      finishOnboarding()
    }
  }, [finishOnboarding, permissionResponse?.status])

  const handleSelect = () => {
    switch (permissionResponse?.status) {
      case PermissionStatus.UNDETERMINED:
        return requestPermission()
      case PermissionStatus.DENIED:
        // TODO: adjust in app
        return Linking.openSettings()
    }
  }

  if (
    !permissionResponse ||
    permissionResponse.status === PermissionStatus.GRANTED
  )
    return <Loading />

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <Space t={80} />
          <Text variant="h1">Control our access.</Text>
          <Space t={30} />
          <Text variant="p">
            Grant access to the photos you would like Photonic to be able to see
            and manage.
          </Text>
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button
          text="Skip"
          size="small"
          variant="secondary"
          onPress={finishOnboarding}
        />
        <Button text="Grant access" size="wide" onPress={handleSelect} />
      </ScrollView.StickyView>
    </>
  )
}

const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator color={"white"} />
  </View>
)

const styles = StyleSheet.create({
  stickyView: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: theme.space.scale[20],
  },
  scroll: { flexGrow: 1 },
  safe: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
