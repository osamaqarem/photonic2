import * as React from "react"
import { type SharedValue } from "react-native-reanimated"
import type { AssetMap } from "~/expo/hooks/useAssets"

interface DragSelectContext {
  assetMap: SharedValue<AssetMap>
  selectedItems: SharedValue<AssetMap>
  selectedItemsKeys: SharedValue<Array<string>>
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
