import { Logger } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { AssetList } from "~/expo/features/home/components/AssetList"
import { ControlPanel } from "~/expo/features/home/components/control-panel"
import { DragSelectContextProvider } from "~/expo/features/home/context/DragSelectContextProvider"
import type { GenericAsset } from "~/expo/features/home/types/asset"
import type { AppParams } from "~/expo/navigation/params"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const totalProgress = useSharedValue(0)

  const openPhoto = (asset: GenericAsset) => {
    logger.log("openPhoto", asset.name)
    props.navigation.navigate("photo", {
      asset,
    })
  }

  const noop = () => {
    console.log("noop")
  }

  return (
    <DragSelectContextProvider>
      <View style={styles.root}>
        <AssetList openPhoto={openPhoto} />
        <ControlPanel.Container>
          <ControlPanel.TopPanel clearSelection={noop}>
            <ControlPanel.TopPanelBtn
              onPress={noop}
              totalProgress={totalProgress}
            />
          </ControlPanel.TopPanel>
          <ControlPanel.BottomPanel
            deleteSelectedItems={noop}
            shareSelectedItems={noop}
            uploadSelectedItems={noop}>
            <ControlPanel.BottomPanelMenu
              removeSelectedItemsFromDevice={noop}
              saveSelectedItemsToDevice={noop}
              removeSelectedItemsRemotely={noop}
            />
          </ControlPanel.BottomPanel>
        </ControlPanel.Container>
      </View>
    </DragSelectContextProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
