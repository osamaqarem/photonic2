import * as React from "react"

import type { ComponentStory } from "~/expo/design/components/Storybook"
import { useDarkMode } from "~/expo/stores/DarkModeProvider"
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
        style={{
          height: 20,
          width: 20,
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
