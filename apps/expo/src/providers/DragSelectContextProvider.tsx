import * as React from "react"
import { type DerivedValue, type SharedValue } from "react-native-reanimated"
import type { AssetMap } from "~/expo/lib/asset-map"

interface DragSelectContext {
  assetMap: DerivedValue<AssetMap>
  selectedItems: SharedValue<AssetMap>
  selectModeActive: SharedValue<boolean>
  selectedItemsCountText: SharedValue<string>
  showGradientOverlay: SharedValue<boolean>
}

const dragSelectContext = React.createContext<Nullable<DragSelectContext>>(null)

export const DragSelectContextProvider: React.FC<
  React.PropsWithChildren<DragSelectContext>
> = ({ children, ...rest }) => {
  return (
    <dragSelectContext.Provider value={rest}>
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
