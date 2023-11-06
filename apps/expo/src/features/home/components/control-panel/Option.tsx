import * as React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Text } from "~/expo/design/components/Text"

interface Props {
  title: string
  icon: React.FC
  onPress?: () => void
}
export const Option: React.FC<Props> = props => {
  const Icon = props.icon
  return (
    <Pressable onPress={props.onPress} style={styles.btn}>
      <Icon />
      <View style={styles.space} />
      <Text variant="span" style={styles.title}>
        {props.title}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  space: {
    height: 8,
  },
  title: {
    maxWidth: 80,
    textAlign: "center",
  },
})
