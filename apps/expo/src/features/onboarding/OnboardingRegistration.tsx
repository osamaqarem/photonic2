import { getErrorMsg } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useState } from "react"
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

export const OnboardingRegistrationScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-registration">
> = props => {
  const { isLoading, mutateAsync } = trpc.auth.issueLoginCode.useMutation()

  const { showError } = useAlerts()

  const [{ email, error }, setForm] = useState({
    email: "",
    error: null as Nullable<string>,
  })

  const onChangeText = (v: string) =>
    setForm(s => ({ ...s, email: v, error: null }))

  const handleLogin = async () => {
    if (email.length === 0) {
      setForm(s => ({ ...s, error: "Please enter your email" }))
      return
    }

    try {
      await mutateAsync({ email })
      props.navigation.navigate("onboarding-code-verification", { email })
    } catch (err) {
      showError(getErrorMsg(err))
    }
  }

  const loginButtonState = () => {
    if (email.length === 0) return ButtonState.Disabled
    else if (isLoading) return ButtonState.Loading
    else return ButtonState.Active
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <Space t={80} />
          <Text variant="h1">Create an account or Sign-in.</Text>
          <Space t={30} />
          <Text variant="p">
            We only need your E-mail. We'll send you a verification code. Please
            enter it in the next screen.
          </Text>
          <Space t={60} />
          <TextInput
            placeholder="E-mail"
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            autoCorrect={false}
            value={email}
            error={error}
            onSubmitEditing={handleLogin}
          />
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.stickyView}>
        <Button
          text="Login"
          size="widest"
          onPress={handleLogin}
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
