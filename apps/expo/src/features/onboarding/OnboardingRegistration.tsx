import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"

import { Button } from "src/design/components/Button"
import { SafeAreaView } from "src/design/components/SafeAreaView"
import { ScrollView } from "src/design/components/ScrollView"
import { Space } from "src/design/components/Space"
import { Text } from "src/design/components/Text"
import { TextInput } from "src/design/components/TextInput"
import { theme } from "src/design/theme"
import { AppParams } from "src/navigation/params"

export const OnboardingRegistrationScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-registration">
> = props => {
  const handleSignIn = () => {
    props.navigation.navigate("onboarding-storage")
  }

  const handleSkip = () => {
    props.navigation.navigate("onboarding-storage")
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <Space t={80} />
          <Text variant="h1">Create your account.</Text>
          <Space t={30} />
          <Text variant="p">
            We only need your e-mail. Don’t worry, it all happens here – no
            verification mail required.
          </Text>
          <Space t={60} />
          <TextInput placeholder="E-mail" />
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button
          text="Skip"
          size="small"
          variant="secondary"
          onPress={handleSkip}
        />
        <Button text="Create account" size="wide" onPress={handleSignIn} />
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
