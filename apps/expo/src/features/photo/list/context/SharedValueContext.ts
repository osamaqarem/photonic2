import * as React from "react"
import type { SharedValue } from "react-native-reanimated"

import type { GenericAsset } from "~/features/photo/list/models/asset"

interface SharedValueContextType {
  assetRecord: SharedValue<Record<string, GenericAsset>>
  selectedItems: SharedValue<Record<string, GenericAsset>>
  selectedItemsKeys: SharedValue<Array<string>>
  selectModeActive: SharedValue<boolean>
  selectedItemsCountText: SharedValue<string>
  showGradientOverlay: SharedValue<boolean>
}

export const SharedValueContext =
  React.createContext<Nullable<SharedValueContextType>>(null)

export const useSharedValueContext = () => {
  const context = React.useContext(SharedValueContext)

  if (!context) {
    throw new Error(
      "useSharedValueContext must be used within SharedValueContext.Provider",
    )
  }

  return context
}
