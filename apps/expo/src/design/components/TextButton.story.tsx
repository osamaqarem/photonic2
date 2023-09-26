import React from "react"

import { TextButton } from "~/expo/design/components/TextButton"
import type { ComponentStory } from "~/expo/design/components/Storybook"

export const TextButtonStory: ComponentStory = {
  name: "TextButton",
  stories: {
    default: () => <TextButton>TextButton</TextButton>,
  },
}
