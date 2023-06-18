import * as React from "react"

import { getIconNames, Icon } from "."
import { ComponentStory } from "../storybook"

let stories: Record<string, () => React.ReactElement> = {}

getIconNames().forEach(iconName => {
  stories[iconName] = () => (
    <Icon key={iconName} name={iconName} className="h-20 w-20 text-black dark:text-white" />
  )
})

export const IconsStory: ComponentStory = {
  name: "Icons",
  stories,
}
