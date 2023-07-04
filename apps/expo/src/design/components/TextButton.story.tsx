import React from "react"

import { TextButton } from "~/design/components/TextButton"
import { ComponentStory } from "~/design/components/Storybook"

export const TextButtonStory: ComponentStory = {
  name: "TextButton",
  stories: {
    default: () => <TextButton>TextButton</TextButton>,
  },
}
