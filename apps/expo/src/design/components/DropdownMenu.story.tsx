import { ComponentStory } from "src/design/components/Storybook"
import { DropdownMenu } from "./DropdownMenu"
import { Text } from "./text/Text"
import { View } from "./View"

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
