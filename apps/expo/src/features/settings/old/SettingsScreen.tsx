import { getErrorMsg } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useQueryClient } from "@tanstack/react-query"
import * as Application from "expo-application"
import * as WebBrowser from "expo-web-browser"
import * as React from "react"
import { Linking, Pressable, View } from "react-native"

import { SafeAreaView } from "~/expo/design/components/SafeAreaView"
import { ScrollView } from "~/expo/design/components/ScrollView"
import { Text } from "~/expo/design/components/Text"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import { Icon } from "~/expo/design/components/icons/Icons"
import { palette, rawPalette } from "~/expo/design/palette"
import { OptionTable } from "~/expo/features/settings/old/components/OptionTable"
import type { AppParams } from "~/expo/navigation/params"
import { useDarkMode } from "~/expo/stores/DarkModeProvider"
import { trpc } from "~/expo/stores/TrpcProvider"
import { useAuth } from "~/expo/stores/auth-store"

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

  const { source, colorScheme } = useDarkMode()
  const isDarkMode = colorScheme === "dark"

  const queryClient = useQueryClient()

  const [state, setState] = React.useState<State>("Undetermined")
  const pending = state === "PendingConnect" || state === "PendingDisconnect"

  const { data } = trpc.user.profile.useQuery(undefined, {
    refetchInterval() {
      if (pending) return 10 * 1000
      return false
    },
    onSuccess(res) {
      if (
        (state === "PendingConnect" || state === "Undetermined") &&
        res.aws.status === "connected"
      ) {
        setState("Connected")
      } else if (
        state === "PendingDisconnect" &&
        !(res.aws.status === "connected")
      ) {
        setState("Undetermined")
      }
    },
  })

  const signOut = useAuth(s => s.actions.signOut)
  const isAuthenticated: boolean = useAuth(
    s => Boolean(s.accessToken) && s.online,
  )

  const handleSignOut = () => {
    signOut()
    queryClient.getQueryCache().clear()
    props.navigation.navigate("home")
  }

  const goToLogin = () => props.navigation.navigate("onboarding-registration")

  const goToSwitchUsers = () => {}

  const goToAppearance = () => console.log("not implemented")

  const openGithubRepo = () => {}

  const goToAbout = () => {}

  const toggleAws = async () => {
    const url = (() => {
      if (state === "Undetermined") {
        setState("PendingConnect")
        return data?.aws.toggleUrl
      } else {
        setState("PendingDisconnect")
        return data?.aws.toggleUrl
      }
    })()

    if (url) {
      await WebBrowser.openAuthSessionAsync(url).catch(err => {
        showError(getErrorMsg(err))
      })
    }
  }

  const renderAwsValue = () => {
    const title = (() => {
      if (pending) return "Pending"
      if (data?.aws.status === "connected") return "Disconnect"
      return "Not connected"
    })()
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "flex-end",
        }}>
        <Text
          variant="span"
          style={{
            color:
              data?.aws.status === "connected"
                ? undefined
                : palette.light.tomato.tomato3,
          }}
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
    <ScrollView
      style={{
        flexGrow: 1,
      }}>
      <SafeAreaView
        style={{
          //   marginTop: NavHeaderHeight,
          //   marginHorizontal: 16,
          //   paddingBottom: 40,
          flex: 1,
        }}>
        <View
          style={{
            flexDirection: "row",
          }}>
          {isAuthenticated ? (
            <>
              <View
                style={{
                  marginLeft: 16,
                  justifyContent: "center",
                }}>
                {/* <Text variant="span">{data?.email ?? "email"}</Text> */}
              </View>
            </>
          ) : (
            <Pressable
              style={{
                height: 128,
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 12,
                backgroundColor: rawPalette.violet.violet8,
                paddingHorizontal: 32,
              }}
              onPress={goToLogin}>
              <Text
                variant="h2"
                style={{
                  width: 240,
                  color: "white",
                }}>
                Create an account to access all features
              </Text>
              <Icon
                name="Newspaper"
                style={{
                  width: 56,
                  color: "white",
                }}
              />
            </Pressable>
          )}
        </View>
        {isAuthenticated ? (
          <>
            <View
              style={{
                height: 40,
              }}
            />
            <OptionTable.Group>
              <OptionTable.Item
                title="AWS Account"
                onPress={toggleAws}
                icon={{
                  name: "Cloud",
                  color: rawPalette.orange.orange4,
                  bgColor: rawPalette.orange.orange5,
                }}
                value={renderAwsValue}
              />
              <OptionTable.Item title="Auto Backup" showChevron value={"Off"} />
            </OptionTable.Group>
          </>
        ) : null}
        <View
          style={{
            height: 28,
          }}
        />
        <OptionTable.Group>
          <OptionTable.Item
            title="Manage Photo Access"
            showChevron
            icon={{
              name: "LockClosed",
              color: rawPalette.indigo.indigo4,
              bgColor: rawPalette.indigo.indigo7,
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
              color: rawPalette.violet.violet4,
              bgColor: rawPalette.violet.violet7,
            }}
          />
        </OptionTable.Group>
        <View
          style={{
            height: 28,
          }}
        />
        <OptionTable.Group>
          <OptionTable.Item
            title="Report a Bug"
            onPress={openGithubRepo}
            showChevron
            icon={{
              name: "Cpu",
              color: rawPalette.green.green4,
              bgColor: rawPalette.green.green7,
            }}
          />
          <OptionTable.Item
            title="About"
            onPress={goToAbout}
            showChevron
            icon={{
              name: "Info",
              color: rawPalette.blue.blue4,
              bgColor: rawPalette.blue.blue7,
            }}
          />
        </OptionTable.Group>
        <View
          style={{
            height: 28,
          }}
        />
        {isAuthenticated ? (
          <OptionTable.Group>
            <OptionTable.Item
              title="Switch Users"
              onPress={goToSwitchUsers}
              showChevron
              icon={{
                name: "Users",
                color: rawPalette.pink.pink4,
                bgColor: rawPalette.pink.pink7,
              }}
            />
            <OptionTable.Item
              title="Sign out"
              showChevron
              onPress={handleSignOut}
              icon={{
                name: "ArrowRightDoor",
                color: rawPalette.red.red4,
                bgColor: rawPalette.red.red7,
              }}
            />
          </OptionTable.Group>
        ) : null}
        <Text
          variant="span"
          style={{
            marginTop: 40,
            alignSelf: "center",
          }}>
          Photonic{" "}
          {`${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}
        </Text>
      </SafeAreaView>
    </ScrollView>
  )
}
