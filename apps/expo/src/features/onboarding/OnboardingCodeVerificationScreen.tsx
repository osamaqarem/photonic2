import { getErrorMsg } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet } from "react-native"

import { Button, ButtonState } from "~/expo/design/components/Button"
import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { TextInput } from "~/expo/design/components/TextInput"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
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

  const { showError } = useAlerts()

  const handleVerify = async (codeVerifier: string) => {
    try {
      const { accessToken, refreshToken, onboardingDone } = await mutateAsync({
        code: codeVerifier,
        email,
      })
      await useAuth
        .getState()
        .actions.setSignedIn({ accessToken, refreshToken })
      if (!onboardingDone) {
        return props.navigation.navigate("onboarding-storage")
      }
      return props.navigation.navigate("onboarding-permissions")
    } catch (err) {
      showError(getErrorMsg(err))
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
          <TextInput
            placeholder="Code"
            onChangeText={(text: string) => {
              setCode(text)
              if (text.length === 5) {
                handleVerify(text)
              }
            }}
          />
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button
          text="Verify"
          size="widest"
          onPress={() => handleVerify(code)}
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
