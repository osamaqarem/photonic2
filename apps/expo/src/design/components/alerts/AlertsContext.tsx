import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet"
import type { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types"
import * as React from "react"
import { Pressable, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"

import { AlertView } from "~/design/components/alerts/components/AlertView"
import { ModalView } from "~/design/components/alerts/components/ModalView"
import { NotificationView } from "~/design/components/alerts/components/NotificationView"
import type { AlertsContextType } from "~/design/components/alerts/models/context"
import type { AlertEntry } from "~/design/components/alerts/models/entry"
import type {
  AlertBtnResult,
  AlertOptions,
  NotificationOptions,
  ModalOptions,
} from "~/design/components/alerts/models/options"

export const AlertsContext = React.createContext<AlertsContextType | null>(null)
export let Alerts: Omit<AlertsContextType, "isPresenting">

const INITIAL_SNAP_POINTS = ["CONTENT_HEIGHT"]

export const AlertsProvider: React.FC<React.PropsWithChildren> = props => {
  //#region Variables
  const { bottom } = useSafeAreaInsets()
  const bottomInset = bottom + 16

  const [currentContent, setCurrentContent] =
    React.useState<React.ReactNode>(null)

  const detached = useSharedValue(true)
  const backdropPressBehavior = useSharedValue<BackdropPressBehavior>("none")
  const floatBottomDistance = useSharedValue<number>(bottomInset)
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
  })

  const sheet = React.useRef<BottomSheetModal>(null)
  const entryList = React.useRef<Array<AlertEntry>>([])
  const prevEntryLength = React.useRef<number>(0)
  const handleDismissResult = React.useRef<unknown>()

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(INITIAL_SNAP_POINTS)
  //#endregion Variables

  //#region Internal methods
  function onDismiss() {
    const currentEntry = entryList.current.shift()
    if (entryList.current.length === 0) {
      prevEntryLength.current = 0
      setCurrentContent(null)
    } else {
      shouldPresent()
    }

    switch (currentEntry?.type) {
      case "ShowError":
        currentEntry.promiseResolver()
        break
      case "ShowAlert":
      case "ShowModal":
        currentEntry.promiseResolver(handleDismissResult.current)
        break
      default:
        throw new Error("Unsupported AlertEntry type")
    }
  }

  const configureSheet = React.useCallback(
    (mode: "detached" | "modal", dismissOnBackdropPress: Maybe<boolean>) => {
      backdropPressBehavior.value = dismissOnBackdropPress ? "close" : "none"
      handleDismissResult.current = null

      switch (mode) {
        case "detached":
          if (!detached.value) {
            detached.value = true
            floatBottomDistance.value = bottomInset
          }
          return
        case "modal":
          if (detached.value) {
            detached.value = false
            floatBottomDistance.value = 0
          }
          return
      }
    },
    [bottomInset, backdropPressBehavior, floatBottomDistance, detached],
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

  //#region Public API
  const handleDismiss = React.useCallback((result?: unknown) => {
    handleDismissResult.current = result
    sheet.current?.dismiss()
  }, [])

  const showAlert = React.useCallback(
    (options: AlertOptions) => {
      const { promise, resolve } = getPromiseResolve<AlertBtnResult>()

      const content = () => <AlertView {...options} onDismiss={handleDismiss} />

      entryList.current.push({
        type: "ShowAlert",
        content,
        promiseResolver: resolve,
        options,
      })

      shouldPresent()
      return promise
    },
    [handleDismiss, shouldPresent],
  )

  const showModal = React.useCallback(
    (options: ModalOptions) => {
      const { promise, resolve } = getPromiseResolve<AlertBtnResult>()

      const content = () => <ModalView {...options} onDismiss={handleDismiss} />

      entryList.current.push({
        type: "ShowModal",
        content,
        promiseResolver: resolve,
        options,
      })

      shouldPresent()
      return promise
    },
    [handleDismiss, shouldPresent],
  )

  const showNotification = React.useCallback(
    (options: NotificationOptions) => {
      const content = () => (
        <NotificationView {...options} onDismiss={handleDismiss} />
      )
      return showModal({
        type: "Custom",
        content,
      }) as unknown as Promise<void>
    },
    [handleDismiss, showModal],
  )

  const showError = React.useMemo(() => {
    function showError(message: string) {
      const { promise, resolve } = getPromiseResolve<void>()

      const text = message || "Something went wrong"

      const content = () => (
        <AlertView
          btn={{ confirmBtnTitle: "OK" }}
          onDismiss={handleDismiss}
          type="Standard"
          title={"Error"}
          message={text}
        />
      )

      entryList.current.push({
        type: "ShowError",
        promiseResolver: resolve,
        content,
      })

      shouldPresent()
      return promise
    }
    // Helper for handling errors
    showError.handle = (err: unknown) => {
      if (err instanceof Error) {
        return showError(err.message)
      } else if (typeof err === "string") {
        return showError(err)
      } else {
        return showError("Something went wrong")
      }
    }
    return showError
  }, [handleDismiss, shouldPresent])
  //#endregion

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => {
      const dismissFromBackdrop = () => {
        if (backdropPressBehavior.value === "close") {
          handleDismissResult.current = "backdrop"
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

  React.useLayoutEffect(() => {
    Alerts = { showAlert, showError, showModal, showNotification }
  }, [showAlert, showError, showModal, showNotification])

  return (
    <AlertsContext.Provider
      value={{
        showAlert,
        showModal,
        showNotification,
        showError,
        isPresenting: Boolean(currentContent),
      }}>
      {props.children}
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={sheet}
          onDismiss={onDismiss}
          snapPoints={animatedSnapPoints}
          handleHeight={animatedHandleHeight}
          contentHeight={animatedContentHeight}
          bottomInset={floatBottomDistance.value}
          enablePanDownToClose={false}
          backgroundComponent={null}
          handleComponent={null}
          backdropComponent={renderBackdrop}
          detached={detached.value}
          style={[styles.sheetContainer, sheetStyle]}>
          <Animated.View
            style={styles.contentContainerStyle}
            onLayout={handleContentLayout}>
            {currentContent}
          </Animated.View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </AlertsContext.Provider>
  )
}

function getPromiseResolve<ResultType = void>() {
  let resolve: (value: ResultType) => void
  const promise = new Promise<ResultType>(res => {
    resolve = res
  })
  return { promise, resolve: resolve! }
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
    backgroundColor: "white",
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
