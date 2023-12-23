import * as React from "react"
import type { ImageSystemSymbolConfiguration } from "react-native-ios-context-menu/lib/typescript/types/ImageItemConfig"
import * as ZeegoDropdownMenu from "zeego/dropdown-menu"

import { StyleSheet } from "react-native"
import { Icon } from "~/expo/design/components/icons/Icons"
import { theme } from "~/expo/design/theme"
import { Option } from "./Option"

export const DropdownMenu = ZeegoDropdownMenu

export type DropdownMenuItemIconConfig = ImageSystemSymbolConfiguration

const iconConfig: DropdownMenuItemIconConfig = {
  pointSize: 16,
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

const Ellipsis = () => <Icon name="Ellipsis" style={styles.blueIcon} />

const styles = StyleSheet.create({
  blueIcon: {
    height: 28,
    width: 28,
    color: theme.colors.primary,
  },
})
