import React from "react"

import { TextInput } from "src/design/components/text-input"
import { ComponentStory } from "src/design/components/storybook"

export const TextInputStory: ComponentStory = {
  name: "TextInput",
  stories: {
    Placeholder: () => <TextInput placeholder="enter your email address" />,
    Populated: () => <TextInput value="textinput-populated@story.com" />,
    Disabled: () => (
      <TextInput editable={false} value="textinput-disabled@story.com" />
    ),
  },
}
