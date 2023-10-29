import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet, View } from "react-native"

import { AssetList } from "~/expo/features/home/components/AssetList"
import { DragSelectContextProvider } from "~/expo/features/home/context/drag-select-context"
import type { AppParams } from "~/expo/navigation/params"

export const HomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "home">
> = () => {
  return (
    <DragSelectContextProvider>
      <View style={styles.root}>
        <AssetList
          openPhoto={() => {
            // TODO:
            console.log("openPhoto")
          }}
        />
      </View>
    </DragSelectContextProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // backgroundColor: theme.colors.background,
  },
})
