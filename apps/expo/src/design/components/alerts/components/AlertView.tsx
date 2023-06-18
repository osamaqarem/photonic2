import * as React from "react"
import { StyleSheet, View } from "react-native"

import { Text } from "src/design/components/TextOld"
import { AlertBtnResult, AlertOptions } from "../models/options"

type Props = AlertOptions & {
  onDismiss: (result: AlertBtnResult) => void
}

export const AlertView: React.FC<Props> = (props: Props) => {
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
      {renderContent()}
      {props.btn && (
        <View style={[styles.btnContainer, btnLayoutStyle]}>
          {props.btn.cancelBtnTitle ? (
            <Text onPress={onCancel} intent="link">
              {props.btn.cancelBtnTitle}
            </Text>
          ) : null}
          <View style={styles.space} />
          <Text onPress={onConfirm} intent="link">
            {props.btn.confirmBtnTitle}
          </Text>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: "black",
    fontWeight: "600",
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
