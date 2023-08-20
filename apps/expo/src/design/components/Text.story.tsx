import React from "react"

import type { ComponentStory } from "~/design/components/Storybook"
import { Text, variants } from "~/design/components/Text"

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
