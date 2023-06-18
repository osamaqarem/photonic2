import { ComponentStory } from "src/design/components/storybook"
import { DropdownMenu } from "."
import { Text } from "../text"
import { View } from "../view"

export const DropdownMenuStory: ComponentStory = {
  name: "DropdownMenu",
  stories: {
    default: () => (
      <View>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Text className="text-xs text-white ">Trigger</Text>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item key="Menu Item Key">Menu item</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>
    ),
  },
}
