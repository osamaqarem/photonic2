import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"

import { Button } from "~/design/components/Button"
import { SafeAreaView } from "~/design/components/SafeAreaView"
import { ScrollView } from "~/design/components/ScrollView"
import { Space } from "~/design/components/Space"
import { Text } from "~/design/components/Text"
import { TextInput } from "~/design/components/TextInput"
import { theme } from "~/design/theme"
import type { AppParams } from "~/navigation/params"

export const OnboardingRegistrationScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-registration">
> = props => {
  const handleSignIn = () => {
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
        <Button text="Create account" size="widest" onPress={handleSignIn} />
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
