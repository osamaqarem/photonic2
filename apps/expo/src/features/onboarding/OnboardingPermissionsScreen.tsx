import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"

import { Button } from "~/expo/design/components/Button"
import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { theme } from "~/expo/design/theme"
import type { AppParams } from "~/expo/navigation/params"

export const OnboardingPermissionsScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-permissions">
> = props => {
  const handleSelect = async () => {
    // show allow all photos popup
    // await Linking.openSettings()
    props.navigation.navigate("onboarding-settings")
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <Space t={80} />
          <Text variant="h1">Control our access.</Text>
          <Space t={30} />
          <Text variant="p">
            Select which photos you would like Photonic to be able to see and
            manage.
          </Text>
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button text="Select" size="wide" onPress={handleSelect} />
      </ScrollView.StickyView>
    </>
  )
}

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
})
