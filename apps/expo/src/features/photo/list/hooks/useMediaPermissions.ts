import * as React from "react"
import { Alert, Linking } from "react-native"

import { Media } from "~/features/photo/list/utils/media"
import { NOOP } from "~/lib/general"

async function checkPermissions(): Promise<boolean> {
  try {
    const res = await Media.getPermissionsAsync()
    return res.granted
  } catch (err) {
    console.warn(err)
    return false
  }
}

async function requestPermissions(): Promise<boolean> {
  try {
    const res = await Media.requestPermissionsAsync()

    if (res.status === Media.PermissionStatus.GRANTED) {
      return true
    }

    if (res.canAskAgain) {
      return await requestPermissions()
    } else {
      Alert.alert(
        "Can't access media library",
        "Please go to settings and enable access to your media library.",
        [
          { text: "Open Settings", onPress: () => Linking.openSettings() },
          { text: "Close", onPress: NOOP },
        ],
      )
      return false
    }
  } catch (err) {
    console.warn(err)
    return false
  }
}

export const useMediaPermissions = (): boolean => {
  const [granted, setGranted] = React.useState(false)

  React.useEffect(() => {
    const authorizeApp = async () => {
      const hasPermissions = await checkPermissions()

      if (hasPermissions) {
        setGranted(true)
      } else {
        const didGrant = await requestPermissions()
        setGranted(didGrant)
      }
    }

    if (!granted) {
      authorizeApp()
    }
  }, [granted])

  return granted
}
