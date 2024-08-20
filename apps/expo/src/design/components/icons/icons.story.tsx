import * as React from "react"

import type { ComponentStory } from "~/expo/design/components/Storybook"
import { useDarkMode } from "~/expo/providers/DarkModeProvider"
import { getIconNames, Icon } from "./Icons"

let stories: Record<string, () => React.ReactElement> = {}

getIconNames().forEach(iconName => {
  stories[iconName] = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { colorScheme } = useDarkMode()

    return (
      <Icon
        key={iconName}
        name={iconName}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: 40,
          width: 40,
          color: colorScheme === "light" ? "black" : "white",
        }}
      />
    )
  }
})

export const IconsStory: ComponentStory = {
  name: "Icons",
  stories,
}
