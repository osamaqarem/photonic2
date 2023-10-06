import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet } from "react-native"

import { Button, ButtonState } from "~/expo/design/components/Button"
import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { TextInput } from "~/expo/design/components/TextInput"
import { theme } from "~/expo/design/theme"
import type { AppParams } from "~/expo/navigation/params"
import { trpc } from "~/expo/stores/TrpcProvider"
import { useAuth } from "~/expo/stores/auth-store"

export const OnboardingCodeVerificationScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-code-verification">
> = props => {
  const { email } = props.route.params

  const { isLoading, mutateAsync } = trpc.auth.verifyLoginCode.useMutation()

  const [code, setCode] = React.useState("")

  const handleVerify = async () => {
    try {
      const { accessToken, refreshToken } = await mutateAsync({ code, email })
      await useAuth
        .getState()
        .actions.setSignedIn({ accessToken, refreshToken })
      props.navigation.navigate("onboarding-storage")
    } catch (err) {
      // TODO:
    }
  }

  const loginButtonState = () => {
    if (code.length === 0) return ButtonState.Disabled
    else if (isLoading) return ButtonState.Loading
    else return ButtonState.Active
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <Space t={80} />
          <Text variant="h1">Verification</Text>
          <Space t={30} />
          <Text variant="p">
            Enter the verification code we sent to your e-mail.
          </Text>
          <Space t={60} />
          <TextInput placeholder="Code" onChangeText={setCode} />
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button
          text="Verify"
          size="widest"
          onPress={handleVerify}
          state={loginButtonState()}
        />
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
