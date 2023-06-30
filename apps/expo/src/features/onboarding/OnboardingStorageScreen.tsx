import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, View } from "react-native"

import { Button } from "src/design/components/Button"
import { SafeAreaView } from "src/design/components/SafeAreaView"
import { ScrollView } from "src/design/components/ScrollView"
import { Space } from "src/design/components/Space"
import { Text } from "src/design/components/Text"
import { palette } from "src/design/palette"
import { theme } from "src/design/theme"
import { AppParams } from "src/navigation/params"

export const OnboardingStorageScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-storage">
> = props => {
  const handleAWSAuth = () => {
    props.navigation.navigate("onboarding-permissions")
  }

  const handleSkip = () => {
    props.navigation.navigate("onboarding-permissions")
  }

  return (
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
          onPress={handleSkip}
        />
        <Button text="Connect to AWS" size="wide" onPress={handleAWSAuth} />
      </ScrollView.StickyView>
    </>
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
