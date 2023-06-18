import * as React from "react"

import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAlerts } from "src/design/components/alerts/hooks/use-alerts"
import { Layout } from "src/design/components/layout"
import { Text } from "src/design/components/text"
import { TextInput } from "src/design/components/text-input"
import { View } from "src/design/components/view"
import { useAuth } from "src/hooks/auth/use-auth"
import type { AppParams } from "src/navigation/native/params"
// import { trpcReact } from "src/providers/trpc/trpc"

export const LoginScreen: React.FC<
  NativeStackScreenProps<AppParams, "login">
> = props => {
  const [email, setEmail] = React.useState("")
  const [retryTimeout, setRetryTimeout] = React.useState<number>(-1)

  const { showError, showNotification } = useAlerts()
  const setSignedIn = useAuth(state => state.actions.setSignedIn)

  // const {
  //   data: code,
  //   mutateAsync: sendEmail,
  //   isLoading: isSendEmailLoading,
  // } = trpcReact.auth["magiclink.sign-in"].useMutation()

  // const trpcUtils = trpcReact.useContext()

  // trpcReact.auth["magiclink.code-verify"].useQuery(
  //   {
  //     code: code ?? "",
  //   },
  //   {
  //     enabled: code ? code.length > 0 : false,
  //     onSuccess: tokens => {
  //       setSignedIn(tokens)
  //       trpcUtils.photo.list.invalidate()
  //       trpcUtils.user.profile.invalidate()
  //       props.navigation.goBack()
  //     },
  //     retry: false,
  //     refetchInterval(data) {
  //       if (data) {
  //         return false
  //       } else {
  //         return 5 * 1000
  //       }
  //     },
  //   },
  // )

  const sendMagicLink = async () => {
    if (email.length < 5) {
      showError("Invalid email")
    } else {
      try {
        await sendEmail({ email })
        showNotification({ message: "Email sent!" })
        setRetryTimeout(45)
        const interval = setInterval(() => {
          setRetryTimeout(t => {
            if (t === 0) {
              clearInterval(interval)
              return -1
            }
            return t - 1
          })
        }, 1000)
      } catch (err) {
        showError.handle(err)
      }
    }
  }

  // const sendMagicLinkDisabled = retryTimeout !== -1 || isSendEmailLoading
  const sendMagicLinkDisabled = retryTimeout !== -1 || isSendEmailLoading

  return (
    <Layout.Safe className="px-4 py-10">
      <View className="flex-1">
        <Text intent="header" size="h1">
          Sign in
        </Text>
        <Text className="mt-4">
          Use the magic link {"we'll"} send to your email to sign in instantly
        </Text>
        <View className="flex-1 justify-center">
          <TextInput
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="enter your email address"
            value={email}
            onChangeText={setEmail}
          />
          <View className="mt-2" />
          <Text size="subtitle1">
            {retryTimeout > -1 ? `You can retry in ${retryTimeout}` : " "}
          </Text>
          <Text
            className="self-end"
            onPress={sendMagicLink}
            disabled={sendMagicLinkDisabled}
            intent={sendMagicLinkDisabled ? "label" : "link"}>
            Send Magic Link
          </Text>
        </View>
      </View>
    </Layout.Safe>
  )
}
