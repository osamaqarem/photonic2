import { styled } from "nativewind"
import * as React from "react"
import { ScrollView as RNScrollView, ScrollViewProps } from "react-native"

const className = "bg-gray-100 dark:bg-black-800"

export const ScrollView: React.FC<React.PropsWithChildren<ScrollViewProps>> =
  styled(props => {
    return <RNScrollView {...props}>{props.children}</RNScrollView>
  }, className)

ScrollView.displayName = "ScrollView"
