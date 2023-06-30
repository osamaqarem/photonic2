import React from "react"
import { View } from "react-native"

import { Button, ButtonState } from "src/design/components/Button"
import { ComponentStory } from "src/design/components/Storybook"
import { theme } from "src/design/theme"

export const ButtonStory: ComponentStory = {
  name: "Button",
  stories: {
    default: () => <Button text="Get Started" />,
    Loading: () => <Button text="Get Started" state={ButtonState.Loading} />,
    Disabled: () => <Button text="Get Started" state={ButtonState.Disabled} />,
    Wide: () => <Button text="Get Started" size="wide" />,
    Small: () => <Button text="Skip" size="small" />,
    SecondaryVariant: () => (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          columnGap: theme.space.scale[20],
          marginTop: theme.space.scale[20],
        }}>
        <Button text="Skip" size="small" variant="secondary" />
        <Button text="Create account" size="wide" />
      </View>
    ),
  },
}
