import React from "react"

import { TextInput } from "~/design/components/TextInput"
import { ComponentStory } from "~/design/components/Storybook"

export const TextInputStory: ComponentStory = {
  name: "TextInput",
  stories: {
    Placeholder: () => <TextInput placeholder="E-mail" />,
    Blank: () => <TextInput />,
    Populated: () => <TextInput value="textinput-populated@story.com" />,
    Disabled: () => (
      <TextInput editable={false} value="textinput-disabled@story.com" />
    ),
    Error: () => (
      <TextInput
        value="textinput-populated@story.com"
        error="The text above seems not perfectly arranged"
      />
    ),
  },
}
