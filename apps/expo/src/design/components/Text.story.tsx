import React from "react"

import { ComponentStory } from "src/design/components/Storybook"
import { Text } from "src/design/components/TextOld"

export const TextStory: ComponentStory = {
  name: "Text",
  stories: {
    default: () => <Text>Hello World</Text>,
    "intent:header": () => <Text intent={"header"}>Hello World</Text>,
    "intent:label": () => <Text intent={"label"}>Hello World</Text>,
    "intent:link": () => <Text intent={"link"}>Hello World</Text>,
    "size:h1": () => <Text size={"h1"}>Hello World</Text>,
    "size:h2": () => <Text size={"h2"}>Hello World</Text>,
    "size:body1": () => <Text size={"body1"}>Hello World</Text>,
    "size:subtitle1": () => <Text size={"subtitle1"}>Hello World</Text>,
    "size:subtitle2": () => <Text size={"subtitle2"}>Hello World</Text>,
  },
}
