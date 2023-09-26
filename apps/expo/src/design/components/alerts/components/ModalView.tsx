import * as React from "react"
import { Button, StyleSheet, View } from "react-native"

import type {
  AlertBtnResult,
  ModalOptions,
} from "~/expo/design/components/alerts/models/options"
import { Text } from "~/expo/design/components/Text"

type Props = ModalOptions & {
  onDismiss: (result: AlertBtnResult) => void
}

export const ModalView: React.FC<Props> = (props: Props) => {
  const btnLayoutStyle =
    props.btn?.layout === "row" ? styles.btnRowStyle : styles.btnColumnStyle

  const onConfirm = () => props.onDismiss("confirm")
  const onCancel = () => props.onDismiss("cancel")

  function renderContent() {
    if (props.type === "Custom") {
      const Component = props.content
      return <Component onDismiss={props.onDismiss} />
    } else {
      return (
        <>
          {props.icon ? "Icon" : null}
          <Text
            style={[
              styles.title,
              {
                marginTop: props.icon ? 20 : 0,
              },
            ]}>
            {props.title}
          </Text>
          {Boolean(props.message) && (
            <Text style={styles.message}>{props.message}</Text>
          )}
        </>
      )
    }
  }

  return (
    <>
      <View style={styles.content}>
        {renderContent()}
        {!!props.btn && (
          <View style={[styles.btnContainer, btnLayoutStyle]}>
            {!!props.btn.cancelBtnTitle && (
              <Button title={props.btn.cancelBtnTitle} onPress={onCancel} />
            )}
            <View style={styles.space} />
            <Button title={props.btn.confirmBtnTitle} onPress={onConfirm} />
          </View>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "black",
    fontWeight: "500",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "black",
    marginTop: 24,
    textAlign: "center",
  },
  btnContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  space: {
    height: 8,
    width: 8,
  },
  btnColumnStyle: {
    flexDirection: "column",
    width: "100%",
  },
  btnRowStyle: {
    flexDirection: "row",
    width: "50%",
  },
})
