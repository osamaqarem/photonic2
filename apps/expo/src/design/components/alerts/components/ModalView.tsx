import * as React from "react"
import { Button, StyleSheet, View } from "react-native"

import type {
  AlertBtnResult,
  ModalOptions,
} from "~/expo/design/components/alerts/models/options"
import { Icon } from "~/expo/design/components/icons/Icons"
import { Text } from "~/expo/design/components/Text"

type Props = ModalOptions & {
  handleDismiss: (result: AlertBtnResult) => void
}

export const ModalView: React.FC<Props> = props => {
  const btnLayoutStyle =
    props.btn?.layout === "row" ? styles.btnRowStyle : styles.btnColumnStyle

  const onConfirm = () => props.handleDismiss("confirm")
  const onCancel = () => props.handleDismiss("cancel")

  function renderContent() {
    if (props.type === "Custom") {
      const Component = props.content
      return <Component dismiss={props.handleDismiss} />
    } else {
      return (
        <>
          {props.icon ? (
            <Icon name={props.icon} style={styles.iconStyle} />
          ) : null}
          <Text
            style={[
              styles.title,
              // eslint-disable-next-line react-native/no-inline-styles
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
  iconStyle: {
    height: 40,
    width: 40,
  },
  content: {
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
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
