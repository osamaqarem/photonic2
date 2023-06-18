import { colors } from "src/design/tailwind"
import { ComponentStory } from "../storybook"
import { Text } from "../text"
import { OptionTable } from "."

export const OptionTableStory: ComponentStory = {
  name: "OptionTable",
  stories: {
    all: () => (
      <OptionTable.Group key={1}>
        <OptionTable.Item
          title="AWS Account"
          onPress={() => {}}
          showChevron
          value={() => <Text>Not Connected</Text>}
          icon={{
            name: "Cloud",
            color: colors.orange[200],
            bgColor: colors.orange[500],
          }}
        />
        <OptionTable.Item
          title="title 2"
          onPress={() => {}}
          value={"Secondary title"}
        />
        <OptionTable.Item
          title="About"
          onPress={() => {}}
          value={"Learn More"}
        />
      </OptionTable.Group>
    ),
  },
}
