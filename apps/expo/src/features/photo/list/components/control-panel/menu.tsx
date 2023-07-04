import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuItemIconConfig,
} from "~/design/components/DropdownMenu"
import { Icon } from "~/design/components/icons/Icons"
import { Option } from "./Option"

const iconConfig: DropdownMenuItemIconConfig = {
  pointSize: 5,
  weight: "light",
  scale: "large",
}

interface Props {
  removeSelectedItemsFromDevice: () => void
  saveSelectedItemsToDevice: () => void
  removeSelectedItemsRemotely: () => void
}

export const BottomPanelMenu: React.FC<Props> = props => {
  const {
    removeSelectedItemsFromDevice,
    saveSelectedItemsToDevice,
    removeSelectedItemsRemotely,
  } = props

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Option title="More" icon={Ellipsis} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item key="Save" onSelect={saveSelectedItemsToDevice}>
          <DropdownMenu.ItemIcon
            ios={{
              name: "arrow.down.app",
              ...iconConfig,
            }}
          />
          <DropdownMenu.ItemTitle>Save To Device</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemSubtitle>
            Download a copy to your device storage
          </DropdownMenu.ItemSubtitle>
        </DropdownMenu.Item>

        <DropdownMenu.Group>
          <DropdownMenu.Item
            key="Remove From Device"
            onSelect={removeSelectedItemsFromDevice}>
            <DropdownMenu.ItemIcon
              ios={{
                name: "xmark.circle",
                ...iconConfig,
              }}
            />
            <DropdownMenu.ItemTitle>Remove From Device</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle>
              Delete the copy in device storage
            </DropdownMenu.ItemSubtitle>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            key="Remove From Cloud"
            onSelect={removeSelectedItemsRemotely}>
            <DropdownMenu.ItemIcon
              ios={{
                name: "externaldrive.badge.xmark",
                ...iconConfig,
              }}
            />
            <DropdownMenu.ItemSubtitle>
              Delete the copy in cloud storage
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemTitle>Remove Backup</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

const Ellipsis = () => (
  <Icon name="Ellipsis" className="h-7 w-7 text-blue-600" />
)
