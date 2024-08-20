import { assert } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import {
  ActivityIndicator,
  LayoutAnimation,
  StyleSheet,
  View,
} from "react-native"

import { Button, ButtonState } from "~/expo/design/components/Button"
import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Space } from "~/expo/design/components/Space"
import { Text } from "~/expo/design/components/Text"
import { TextInput } from "~/expo/design/components/TextInput"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import { theme } from "~/expo/design/theme"
import { useSafeIntervalRef } from "~/expo/hooks/useSafeIntervalRef"
import { handleError } from "~/expo/lib/error"
import type { AppParams } from "~/expo/navigation/params"
import { trpc } from "~/expo/providers/TrpcProvider"
import { useAuth } from "~/expo/stores/auth-store"

export const OnboardingCodeVerificationScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-code-verification">
> = props => {
  const { email } = props.route.params

  const { showError } = useAlerts()

  const [code, setCode] = React.useState("")
  const [cooldown, setCooldown] = React.useState<number | null>(null)
  const [showRequestCode, setShowRequestCode] = React.useState(false)

  const cooldownRef = useSafeIntervalRef()

  useTimeoutActionOnce(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowRequestCode(true)
  }, 5000)

  const { isLoading, mutateAsync } = trpc.auth.verifyLoginCode.useMutation()

  const issueCode = trpc.auth.issueLoginCode.useMutation({
    onSuccess: runCooldown,
  })

  function runCooldown() {
    setCooldown(60)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        assert(cooldownRef.current)
        const done = prev === 0 || prev === null
        if (done) {
          clearInterval(cooldownRef.current)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerify = async (codeVerifier: string) => {
    try {
      const { accessToken, refreshToken, idToken } = await mutateAsync({
        code: codeVerifier,
        email,
      })
      const user = useAuth.getState().actions.signIn({
        idToken,
        accessToken,
        refreshToken,
      })
      if (!user.awsAccountId) {
        return props.navigation.navigate("onboarding-storage")
      }
      return props.navigation.navigate("onboarding-permissions")
    } catch (error) {
      handleError({
        error,
        transactionName: "verifyLoginCode",
        message: "An error occured while uploading photos.",
      })
    }
  }

  const loginButtonState = () => {
    if (code.length === 0) return ButtonState.Disabled
    else if (isLoading) return ButtonState.Loading
    else return ButtonState.Active
  }

  const onChangeText = (text: string) => {
    if (isLoading) return
    setCode(text)
    if (text.length === 5) {
      handleVerify(text)
    }
  }

  const renderRequestCode = () => {
    if (!showRequestCode) return null
    return (
      <View style={styles.requestAnother}>
        <Text
          disabled={!!cooldown}
          onPress={() => issueCode.mutate({ email })}
          variant="span">
          Request another code{" "}
        </Text>
        <Text variant="span">{cooldown ? `(${cooldown})` : " "}</Text>
        <ActivityIndicator size={"small"} animating={issueCode.isLoading} />
      </View>
    )
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
            onChangeText={onChangeText}
            maxLength={5}
            onSubmitEditing={() => handleVerify(code)}
          />
          <Space t={16} />
          {renderRequestCode()}
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
  requestAnother: {
    flexDirection: "row",
    alignItems: "center",
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

const useTimeoutActionOnce = (action: () => void, ms: number) => {
  React.useEffect(() => {
    const timeout = setTimeout(action, ms)
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
