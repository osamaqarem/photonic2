import React from "react"

import { Button, ButtonState } from "src/design/components/Button"
import { ComponentStory } from "src/design/components/Storybook"

export const ButtonStory: ComponentStory = {
  name: "Button",
  stories: {
    default: () => <Button text="Button" />,
    Loading: () => <Button text="Button" state={ButtonState.Loading} />,
    Disabled: () => <Button text="Button" state={ButtonState.Disabled} />,
  },
}
