import { Logger } from "@photonic/common"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet, View } from "react-native"

import { AssetList } from "~/expo/features/home/components/AssetList"
import { DragSelectContextProvider } from "~/expo/features/home/context/DragSelectContextProvider"
import type { GenericAsset } from "~/expo/features/home/types/asset"
import type { AppParams } from "~/expo/navigation/params"

const logger = new Logger("HomeScreen")

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = props => {
  const openPhoto = (asset: GenericAsset) => {
    logger.log("openPhoto", asset.name)
    props.navigation.navigate("photo", {
      asset,
    })
  }

  return (
    <DragSelectContextProvider>
      <View style={styles.root}>
        <AssetList openPhoto={openPhoto} />
      </View>
    </DragSelectContextProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
