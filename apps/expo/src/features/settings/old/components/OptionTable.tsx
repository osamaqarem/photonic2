import * as React from "react"
import type { StyleProp, TextStyle, ViewProps } from "react-native"
import { PixelRatio, Pressable, StyleSheet, View } from "react-native"

import { Text } from "~/expo/design/components/Text"
import type { Icons } from "~/expo/design/components/icons/Icons"
import { Icon } from "~/expo/design/components/icons/Icons"
import { palette } from "~/expo/design/palette"
import { theme } from "~/expo/design/theme"

interface Props {
  title: string | React.FC
  value?: string | React.FC
  onPress?: () => void
  showChevron?: boolean
  icon?: {
    name: Icons
    bgColor: string
    color: string
  }
}
const Item: React.FC<Props> = props => {
  const renderElement = (
    element: string | React.FC,
    style?: StyleProp<TextStyle>,
  ) => {
    if (typeof element === "string") {
      return (
        <Text numberOfLines={1} variant="span" style={style}>
          {element}
        </Text>
      )
    } else {
      const Title = element
      return <Title />
    }
  }

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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        {props.icon ? (
          <>
            <IconCircle {...props.icon} />
            <View
              style={{
                width: 12,
              }}
            />
          </>
        ) : null}
        {renderElement(props.title)}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
        }}>
        <View
          style={{
            width: 128,
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}>
          {props.value
            ? renderElement(props.value, { color: theme.colors.text })
            : null}
        </View>
        {props.showChevron ? (
          <>
            <View
              style={{
                width: 8,
              }}
            />
            <Icon
              name="ChevronRight"
              style={{
                height: 20,
                width: 20,
                color: theme.colors.text,
              }}
            />
          </>
        ) : null}
      </View>
    </Pressable>
  )
}

const bgColor = "bg-white dark:bg-black-600"
const Container: React.FC<ViewProps> = props => (
  <View
    style={{
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: bgColor,
    }}>
    {props.children}
  </View>
)
const TopRow: React.FC<ViewProps> = props => (
  <View
    style={{
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: bgColor,
    }}>
    {props.children}
  </View>
)
const MidRow: React.FC<ViewProps> = props => (
  <View
    style={{
      borderRadius: 8,
      backgroundColor: bgColor,
    }}>
    {props.children}
  </View>
)
const BotRow: React.FC<ViewProps> = props => (
  <View
    style={{
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      backgroundColor: bgColor,
    }}>
    {props.children}
  </View>
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
    style={{
      height: PixelRatio.roundToNearestPixel(StyleSheet.hairlineWidth * 2),
      width: "75%",
      alignSelf: "center",
      backgroundColor: palette.light.slate.slate1,
    }}
  />
)

const IconCircle = ({ name, bgColor, color }: NonNullable<Props["icon"]>) => (
  <View
    style={{
      height: 32,
      width: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: bgColor,
    }}>
    <Icon name={name} style={{ color: color, width: 20, height: 20 }} />
  </View>
)

export const OptionTable = {
  Group,
  Item,
}
