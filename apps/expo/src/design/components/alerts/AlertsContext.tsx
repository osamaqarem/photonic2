import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet"
import type { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types"
import mitt from "mitt"
import * as React from "react"
import { Pressable, StyleSheet } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AlertView } from "~/expo/design/components/alerts/components/AlertView"
import { ModalView } from "~/expo/design/components/alerts/components/ModalView"
import { NotificationView } from "~/expo/design/components/alerts/components/NotificationView"
import type { AlertsContext } from "~/expo/design/components/alerts/models/context"
import type { AlertEntry } from "~/expo/design/components/alerts/models/entry"
import type {
  AlertBtnResult,
  BaseOptions,
  ModalOptions,
  NotificationOptions,
} from "~/expo/design/components/alerts/models/options"
import { theme } from "~/expo/design/theme"

export const alertsContext = React.createContext<AlertsContext | null>(null)

type Events = {
  [Key in keyof AlertsContext]: Parameters<AlertsContext[Key]>[0]
}
export const alertsEmitter = mitt<Events>()

export const AlertsProvider: React.FC<React.PropsWithChildren> = props => {
  //#region Variables
  const { bottom } = useSafeAreaInsets()
  const bottomInset = bottom + 16

  const [currentContent, setCurrentContent] =
    React.useState<React.ReactNode>(null)
  const [floatBottomDistance, setFloatBottomDistance] = React.useState(0)

  const detached = useSharedValue(true)
  const backdropPressBehavior = useSharedValue<BackdropPressBehavior>("none")
  const sheetStyle = useAnimatedStyle(() => {
    if (detached.value) {
      return {
        marginHorizontal: 16,
      }
    } else {
      return {
        marginHorizontal: 0,
      }
    }
  }, [detached.value])

  const sheet = React.useRef<BottomSheetModal>(null)
  const entryList = React.useRef<Array<AlertEntry>>([])
  const prevEntryLength = React.useRef(0)
  const dismissResult = React.useRef<Nullable<AlertBtnResult>>()

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(["CONTENT_HEIGHT"])
  //#endregion Variables

  //#region Internal methods
  function onDismiss() {
    const currentEntry = entryList.current.shift()
    switch (currentEntry?.type) {
      case "ShowError":
        currentEntry.promiseResolver()
        break
      case "ShowAlert":
      case "ShowModal":
        if (!dismissResult.current) {
          throw new Error("Unexpected null result")
        }
        currentEntry.promiseResolver(dismissResult.current)
        break
      default:
        throw new Error("Unsupported AlertEntry type")
    }

    if (entryList.current.length === 0) {
      prevEntryLength.current = 0
      setCurrentContent(null)
    } else {
      shouldPresent()
    }
  }

  const configureSheet = React.useCallback(
    (mode: "detached" | "modal", dismissOnBackdropPress: Maybe<boolean>) => {
      backdropPressBehavior.value = dismissOnBackdropPress ? "close" : "none"
      dismissResult.current = null

      switch (mode) {
        case "detached":
          detached.value = true
          setFloatBottomDistance(bottomInset)
          return
        case "modal":
          detached.value = false
          setFloatBottomDistance(0)
          return
      }
    },
    [bottomInset, backdropPressBehavior, detached],
  )

  const shouldPresent = React.useCallback(() => {
    const present = () => {
      const entry = entryList.current[0]
      if (!entry) return
      const Content = entry.content

      switch (entry.type) {
        case "ShowAlert":
          configureSheet("detached", entry.options.dismissOnBackdropPress)
          break
        case "ShowError":
          configureSheet("detached", true)
          break
        case "ShowModal":
          configureSheet("modal", entry.options.dismissOnBackdropPress)
          break
      }

      setCurrentContent(<Content />)
      sheet.current?.present()
    }

    const isFirstEntry =
      entryList.current.length === 1 && prevEntryLength.current === 0
    const hasQueuedEntry =
      entryList.current.length > 0 &&
      prevEntryLength.current > entryList.current.length

    if (isFirstEntry || hasQueuedEntry) {
      present()
    }

    prevEntryLength.current = entryList.current.length
  }, [configureSheet])
  //#endregion Internal methods

  const dismiss = React.useCallback((result?: AlertBtnResult) => {
    dismissResult.current = result
    sheet.current?.dismiss()
  }, [])

  //#region Public API

  const showAlert = React.useCallback(
    (options: BaseOptions) => {
      const { promise, resolve } = getPromiseAndResolver<AlertBtnResult>()

      const content = () => <AlertView {...options} handleDismiss={dismiss} />

      entryList.current.push({
        type: "ShowAlert",
        content,
        promiseResolver: resolve,
        options,
      })

      shouldPresent()
      return promise
    },
    [dismiss, shouldPresent],
  )

  const showModal = React.useCallback(
    (options: ModalOptions) => {
      const { promise, resolve } = getPromiseAndResolver<AlertBtnResult>()

      const content = () => <ModalView {...options} handleDismiss={dismiss} />

      entryList.current.push({
        type: "ShowModal",
        content,
        promiseResolver: resolve,
        options,
      })

      shouldPresent()
      return promise
    },
    [dismiss, shouldPresent],
  )

  const showNotification = React.useCallback(
    (options: NotificationOptions) => {
      const content = () => (
        <NotificationView
          {...options}
          handleDismiss={() => dismiss("timeout")}
        />
      )
      return showModal({
        type: "Custom",
        content,
      }) as Promise<void>
    },
    [dismiss, showModal],
  )

  const showError = React.useCallback(
    (message: string) => {
      const { promise, resolve } = getPromiseAndResolver<void>()

      const content = () => (
        <AlertView
          btn={{ confirmBtnTitle: "OK" }}
          handleDismiss={dismiss}
          type="Standard"
          title={"Error"}
          message={message}
        />
      )

      entryList.current.push({
        type: "ShowError",
        promiseResolver: resolve,
        content,
      })

      shouldPresent()
      return promise
    },
    [dismiss, shouldPresent],
  )
  //#endregion

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => {
      const dismissFromBackdrop = () => {
        if (backdropPressBehavior.value === "close") {
          dismissResult.current = "backdrop"
        }
      }

      return (
        <BottomSheetBackdrop
          {...backdropProps}
          pressBehavior={backdropPressBehavior.value}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.75}>
          <Pressable
            onPress={dismissFromBackdrop}
            style={styles.backdropInner}
          />
        </BottomSheetBackdrop>
      )
    },
    [backdropPressBehavior.value],
  )

  const memoized = React.useMemo(
    () => ({ showAlert, showError, showModal, showNotification }),
    [showAlert, showError, showModal, showNotification],
  )

  React.useEffect(() => {
    const handler = <Method extends keyof Events>(
      type: Method,
      config: Events[Method],
    ) => {
      // @ts-expect-error config type is a union of all configs
      return memoized[type](config)
    }
    alertsEmitter.on("*", handler)
    return () => {
      alertsEmitter.off("*", handler)
    }
  }, [memoized])

  return (
    <alertsContext.Provider value={memoized}>
      {props.children}
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={sheet}
          onDismiss={onDismiss}
          // @ts-expect-error bad lib type
          snapPoints={animatedSnapPoints}
          handleHeight={animatedHandleHeight}
          contentHeight={animatedContentHeight}
          bottomInset={floatBottomDistance}
          backgroundComponent={null}
          handleComponent={null}
          backdropComponent={renderBackdrop}
          detached
          style={[styles.sheetContainer, sheetStyle]}>
          <Animated.View
            style={styles.contentContainerStyle}
            onLayout={handleContentLayout}>
            {currentContent}
          </Animated.View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </alertsContext.Provider>
  )
}

function getPromiseAndResolver<ResultType = void>() {
  let resolve!: (value: ResultType) => void
  const promise = new Promise<ResultType>(res => {
    resolve = res
  })
  return { promise, resolve }
}

const styles = StyleSheet.create({
  backdropInner: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  sheetContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.elementSecondaryBg,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16.0,
    elevation: 24,
  },
  contentContainerStyle: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
})
