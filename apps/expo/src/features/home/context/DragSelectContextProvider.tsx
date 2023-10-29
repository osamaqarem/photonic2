import * as React from "react"
import {
  useSharedValue,
  type SharedValue,
  useDerivedValue,
} from "react-native-reanimated"

import type { GenericAsset } from "~/expo/features/home/types/asset"

interface DragSelectContext {
  assetRecord: SharedValue<Record<string, GenericAsset>>
  selectedItems: SharedValue<Record<string, GenericAsset>>
  selectedItemsKeys: SharedValue<Array<string>>
  selectModeActive: SharedValue<boolean>
  selectedItemsCountText: SharedValue<string>
  showGradientOverlay: SharedValue<boolean>
}

const dragSelectContext = React.createContext<Nullable<DragSelectContext>>(null)

export const DragSelectContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const assetRecord = useSharedValue<Record<string, GenericAsset>>({})

  const selectedItems = useSharedValue<Record<string, GenericAsset>>({})
  const selectedItemsKeys = useDerivedValue(() =>
    Object.keys(selectedItems.value),
  )
  const selectModeActive = useDerivedValue(
    () => selectedItemsKeys.value.length > 0,
  )
  const selectedItemsCountText = useDerivedValue(() =>
    selectedItemsKeys.value.length.toString(),
  )

  const showGradientOverlay = useSharedValue(false)

  return (
    <dragSelectContext.Provider
      value={React.useMemo(
        () => ({
          assetRecord,
          selectedItems,
          selectedItemsKeys,
          selectModeActive,
          selectedItemsCountText,
          showGradientOverlay,
        }),
        [
          assetRecord,
          selectModeActive,
          selectedItems,
          selectedItemsCountText,
          selectedItemsKeys,
          showGradientOverlay,
        ],
      )}>
      {children}
    </dragSelectContext.Provider>
  )
}

export const useDragSelectContext = () => {
  const context = React.useContext(dragSelectContext)

  if (!context) {
    throw new Error(
      "useDragSelectContext must be used within dragSelectContext.Provider",
    )
  }

  return context
}
