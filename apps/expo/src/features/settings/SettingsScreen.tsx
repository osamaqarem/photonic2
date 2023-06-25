// import { useQueryClient } from "@tanstack/react-query"
import * as Application from "expo-application"
import * as WebBrowser from "expo-web-browser"
import * as React from "react"
import { Linking, Pressable } from "react-native"
import FastImage from "react-native-fast-image"

import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAlerts } from "src/design/components/alerts/useAlerts"
import { Icon } from "src/design/components/icons/Icons"
import { Layout } from "src/design/components/Layout"
import { OptionTable } from "src/design/components/OptionsTable"
import { ScrollView } from "src/design/components/ScrollViewOld"
import { Text } from "src/design/components/TextOld"
import { View } from "react-native"
import { colors } from "src/design/tailwind"
import { useAuth } from "src/stores/auth/useAuth"
import { AppParams } from "src/navigation/params"
import { useDarkMode } from "src/stores/DarkModeProvider"
// import { trpcReact } from "src/providers/trpc/trpc"
import { useInfiniteAssets } from "../photo/list/hooks/useInfiniteAssets"

// value reference
// https://github.com/software-mansion/react-native-screens/blob/b9471bebe70d83c71740c5a308af9ea7ad377821/native-stack/README.md#measuring-headers-height-on-ios
const NavHeaderHeight = 44

type State =
  | "Undetermined"
  | "Connected"
  | "PendingConnect"
  | "PendingDisconnect"

export const SettingsScreen: React.FC<
  NativeStackScreenProps<AppParams, "settings">
> = props => {
  const { showError } = useAlerts()

  const { source, isDarkMode } = useDarkMode()

  const trpcUtils = trpcReact.useContext()
  const queryClient = useQueryClient()

  const [state, setState] = React.useState<State>("Undetermined")
  const pending = state === "PendingConnect" || state === "PendingDisconnect"

  const { data } = trpcReact.user.profile.useQuery(undefined, {
    refetchInterval() {
      if (pending) return 10 * 1000
      return false
    },
    onSuccess(res) {
      if (
        (state === "PendingConnect" || state === "Undetermined") &&
        res.aws.connected
      ) {
        setState("Connected")
      } else if (state === "PendingDisconnect" && !res.aws.connected) {
        setState("Undetermined")
      }
    },
  })

  const signOut = useAuth(s => s.actions.setSignedOut)
  const isAuthenticated: boolean = useAuth(
    s => Boolean(s.accessToken) && !s.offline,
  )

  const handleSignOut = () => {
    trpcUtils.photo.list.setInfiniteData(
      { limit: useInfiniteAssets.remoteLimit },
      {
        pageParams: [],
        pages: [{ nextCursor: undefined, assets: [] }],
      },
    )
    signOut()
    queryClient.getQueryCache().clear()
    props.navigation.navigate("home")
  }

  const goToLogin = () => props.navigation.navigate("login")

  const goToSwitchUsers = () => {}

  const goToAppearance = () => props.navigation.navigate("appearance")

  const openGithubRepo = () => {}

  const goToAbout = () => {}

  const toggleAws = async () => {
    const url = (() => {
      if (state === "Undetermined") {
        setState("PendingConnect")
        return data?.aws.connectUrl
      } else {
        setState("PendingDisconnect")
        return data?.aws.disconnectUrl
      }
    })()

    if (url) {
      await WebBrowser.openAuthSessionAsync(url).catch(showError.handle)
    }
  }

  const renderAwsValue = () => {
    const title = (() => {
      if (pending) return "Pending"
      if (data?.aws.connected) return "Disconnect"
      return "Not connected"
    })()
    return (
      <View className="items-end justify-center">
        <Text
          size={"subtitle1"}
          className={
            data?.aws.connected ? "" : "text-orange-200 dark:text-orange-400"
          }
          numberOfLines={1}>
          {title}
        </Text>
      </View>
    )
  }

  const appearanceValue = (() => {
    if (source === "system") return "System"
    if (isDarkMode) return "Dark"
    else return "Light"
  })()

  return (
    <ScrollView>
      <Layout.Safe
        className="px-4 pb-10"
        style={{
          marginTop: NavHeaderHeight,
        }}>
        <View>
          <View className="flex-row">
            {isAuthenticated ? (
              <>
                <FastImage
                  className="h-12 w-12 rounded-full bg-gray-200 dark:bg-black-600"
                  source={{ uri: data?.image ?? undefined }}
                />
                <View className="ml-4 justify-center">
                  <Text size="subtitle2">{data?.name ?? "name"}</Text>
                  <Text size="subtitle2">{data?.email ?? "email"}</Text>
                </View>
              </>
            ) : (
              <Pressable
                className="h-32 flex-1 flex-row items-center justify-between rounded-xl bg-violet-600 px-8 dark:bg-violet-700"
                onPress={goToLogin}>
                <Text intent={"header"} size="h2" className="w-60 text-white">
                  Create an account to access all features
                </Text>
                <Icon name="Newspaper" className="h-14 w-14 text-white" />
              </Pressable>
            )}
          </View>
          {isAuthenticated ? (
            <>
              <View className="h-10" />
              <OptionTable.Group>
                <OptionTable.Item
                  title="AWS Account"
                  onPress={toggleAws}
                  icon={{
                    name: "Cloud",
                    color: colors.orange[200],
                    bgColor: colors.orange[500],
                  }}
                  value={renderAwsValue}
                />
                <OptionTable.Item
                  title="Auto Backup"
                  showChevron
                  value={"Off"}
                />
              </OptionTable.Group>
            </>
          ) : null}
          <View className="h-7" />
          <OptionTable.Group>
            <OptionTable.Item
              title="Manage Photo Access"
              showChevron
              icon={{
                name: "LockClosed",
                color: colors.indigo[200],
                bgColor: colors.indigo[500],
              }}
              onPress={Linking.openSettings}
            />
            <OptionTable.Item
              title="Appearance"
              onPress={goToAppearance}
              value={appearanceValue}
              showChevron
              icon={{
                name: "Moon",
                color: colors.purple[200],
                bgColor: colors.purple[500],
              }}
            />
          </OptionTable.Group>
          <View className="h-7" />
          <OptionTable.Group>
            <OptionTable.Item
              title="Report a Bug"
              onPress={openGithubRepo}
              showChevron
              icon={{
                name: "Cpu",
                color: colors.emerald[200],
                bgColor: colors.emerald[500],
              }}
            />
            <OptionTable.Item
              title="About"
              onPress={goToAbout}
              showChevron
              icon={{
                name: "Info",
                color: colors.blue[200],
                bgColor: colors.blue[500],
              }}
            />
          </OptionTable.Group>
          <View className="h-7" />
          {isAuthenticated ? (
            <OptionTable.Group>
              <OptionTable.Item
                title="Switch Users"
                onPress={goToSwitchUsers}
                showChevron
                icon={{
                  name: "Users",
                  color: colors.pink[200],
                  bgColor: colors.pink[500],
                }}
              />
              <OptionTable.Item
                title="Sign out"
                showChevron
                onPress={handleSignOut}
                icon={{
                  name: "ArrowRightDoor",
                  color: colors.red[200],
                  bgColor: colors.red[500],
                }}
              />
            </OptionTable.Group>
          ) : null}
          <Text intent="label" size="subtitle2" className="mt-10 self-center">
            Photonic{" "}
            {`${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}
          </Text>
        </View>
      </Layout.Safe>
    </ScrollView>
  )
}
