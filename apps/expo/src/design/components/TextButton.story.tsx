import React from "react"

import { TextButton } from "src/design/components/TextButton"
import { ComponentStory } from "src/design/components/Storybook"

export const TextButtonStory: ComponentStory = {
  name: "TextButton",
  stories: {
    default: () => <TextButton>TextButton</TextButton>,
  },
}
