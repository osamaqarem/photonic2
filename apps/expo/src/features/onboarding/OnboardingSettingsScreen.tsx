import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, View } from "react-native"

import { Button } from "~/design/components/Button"
import { SafeAreaView } from "~/design/components/SafeAreaView"
import { ScrollView } from "~/design/components/ScrollView"
import { Space } from "~/design/components/Space"
import { Text } from "~/design/components/Text"
import { palette } from "~/design/palette"
import { theme } from "~/design/theme"
import { useAuth } from "~/navigation/Navigation"
import type { AppParams } from "~/navigation/params"

export const OnboardingSettingsScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-settings">
> = () => {
  const handleDone = () => {
    useAuth.setState({ authenticated: true })
    // setAuthenicated
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <Space t={80} />
          <Text variant="h1">Adjust your experience.</Text>
          <Space t={30} />
          <View style={styles.table} />
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button text="Done" size="wide" onPress={handleDone} />
      </ScrollView.StickyView>
    </>
  )
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: palette.light.slate.slate6,
    width: "100%",
    height: 500,
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
