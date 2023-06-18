import * as React from "react"
import { PixelRatio, StyleSheet } from "react-native"

import { Icon, IconNames } from "src/design/components/icons"
import { Pressable } from "src/design/components/pressable"
import { Text } from "src/design/components/text"
import { View, ViewProps } from "../view"

interface Props {
  title: string | React.FC
  value?: string | React.FC
  onPress?: () => void
  showChevron?: boolean
  icon?: {
    name: IconNames
    bgColor: string
    color: string
  }
}
const Item: React.FC<Props> = props => {
  const renderElement = (element: string | React.FC, className?: string) => {
    if (typeof element === "string") {
      return (
        <Text numberOfLines={1} className={["text-sm", className].join(" ")}>
          {element}
        </Text>
      )
    } else {
      const Title = element
      return <Title />
    }
  }

  const textColor = "text-gray-400 dark:text-gray-500"

  return (
    <Pressable
      // nativewind bug:
      // do not use 'className' for this component
      // it would re-render with malformed UI
      style={{
        flex: 1,
        flexDirection: "row",
        padding: 16,
        justifyContent: "space-between",
      }}
      onPress={props.onPress}>
      <View className="flex-row items-center justify-between">
        {props.icon ? (
          <>
            <IconCircle {...props.icon} />
            <View className="w-3" />
          </>
        ) : null}
        {renderElement(props.title)}
      </View>
      <View className="flex-1 flex-row items-center justify-end">
        <View className="w-32 items-end justify-end">
          {props.value ? renderElement(props.value, textColor) : null}
        </View>
        {props.showChevron ? (
          <>
            <View className="w-2" />
            <Icon
              name="ChevronRight"
              className={["h-5 w-5", textColor].join(" ")}
            />
          </>
        ) : null}
      </View>
    </Pressable>
  )
}

const bgColor = "bg-white dark:bg-black-600"
const Container: React.FC<ViewProps> = props => (
  <View className={["rounded-t-lg rounded-b-lg", bgColor].join(" ")}>
    {props.children}
  </View>
)
const TopRow: React.FC<ViewProps> = props => (
  <View className={["rounded-t-lg", bgColor].join(" ")}>{props.children}</View>
)
const MidRow: React.FC<ViewProps> = props => (
  <View className={["rounded-lg", bgColor].join(" ")}>{props.children}</View>
)
const BotRow: React.FC<ViewProps> = props => (
  <View className={["rounded-b-lg", bgColor].join(" ")}>{props.children}</View>
)

type GroupProps = React.FC<React.PropsWithChildren>
const Group: GroupProps = props => {
  const childrenArr = React.Children.toArray(props.children)
  if (childrenArr.length === 1) {
    return <MidRow>{props.children}</MidRow>
  } else if (childrenArr.length === 2) {
    return (
      <Container>
        <TopRow>{childrenArr[0]}</TopRow>
        <Separator />
        <BotRow>{childrenArr[1]}</BotRow>
      </Container>
    )
  } else {
    return (
      <Container>
        {childrenArr.map((child, index) => {
          if (index === 0) {
            return <TopRow key={index}>{child}</TopRow>
          } else if (index === childrenArr.length - 1) {
            return <BotRow key={index}>{child}</BotRow>
          } else {
            return (
              <View key={index}>
                <Separator />
                <MidRow>{child}</MidRow>
                <Separator />
              </View>
            )
          }
        })}
      </Container>
    )
  }
}

const Separator = () => (
  <View
    className="w-3/4 self-center bg-gray-100 dark:bg-gray-800"
    style={{
      height: PixelRatio.roundToNearestPixel(StyleSheet.hairlineWidth * 2),
    }}
  />
)

const IconCircle = ({ name, bgColor, color }: NonNullable<Props["icon"]>) => (
  <View
    className="h-8 w-8 items-center justify-center rounded-full"
    style={{
      backgroundColor: bgColor,
    }}>
    <Icon name={name} className="h-5 w-5" style={{ color: color }} />
  </View>
)

export const OptionTable = {
  Group,
  Item,
}
