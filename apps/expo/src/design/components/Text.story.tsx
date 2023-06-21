import React from "react"

import { ComponentStory } from "src/design/components/Storybook"
import { Text, variants } from "src/design/components/Text"

const phrase = "The Photonic app manages photos."

export const TextStory: ComponentStory = {
  name: "Text",
  stories: {
    default: () => <Text>{phrase}</Text>,
    ...Object.keys(variants).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: () => (
          <Text variant={curr as keyof typeof variants}>{phrase}</Text>
        ),
      }),
      {},
    ),
  },
}
