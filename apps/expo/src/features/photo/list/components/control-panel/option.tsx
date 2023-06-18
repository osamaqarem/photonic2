import * as React from "react"

import { Text } from "src/design/components/Text"
import { View } from "src/design/components/View"
import { Pressable } from "src/design/components/Pressable"

interface Props {
  title: string
  icon: React.FC
  onPress?: () => void
}
export const Option: React.FC<Props> = props => {
  const Icon = props.icon
  return (
    <Pressable onPress={props.onPress} className="items-center px-3">
      <Icon />
      <View className="h-2" />
      <Text className="max-w-[80px] text-center" size="subtitle2">
        {props.title}
      </Text>
    </Pressable>
  )
}
