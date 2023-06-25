import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, View, ViewStyle } from "react-native"

import { SafeAreaView } from "src/design/components/SafeAreaView"
import { ScrollView } from "src/design/components/ScrollView"
import { Text } from "src/design/components/Text"
import { rawPalette } from "src/design/palette"
import { theme } from "src/design/theme"
import { AppParams } from "src/navigation/params"

export const WelcomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "welcome">
> = () => {
  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <Text variant="h2">Photonic</Text>
            <View style={styles.blobs}>
              {blobs.map(item => (
                <View key={item?.backgroundColor} style={[styles.blob, item]} />
              ))}
            </View>
            <Text variant="h1">The open source photo backup app.</Text>
          </View>
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyButton
        text={"Get started"}
        containerStyle={styles.btnContainer}
      />
    </>
  )
}

const blobs = [
  {
    backgroundColor: rawPalette.sky.sky7,
  },
  {
    backgroundColor: rawPalette.amber.amber8,
    marginTop: -30,
    marginLeft: 75,
    zIndex: -1,
  },
  {
    backgroundColor: rawPalette.lime.lime8,
    top: -30,
    marginLeft: 0,
    zIndex: -2,
  },
  {
    backgroundColor: rawPalette.yellow.yellow8,
    top: -250,
    marginLeft: 170,
  },
  {
    backgroundColor: rawPalette.mint.mint9,
    marginLeft: 200,
    top: -280,
  },
] satisfies Array<ViewStyle>

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "space-between",
    margin: theme.space.contentPadding,
  },
  blob: {
    width: 150,
    height: 150,
    borderRadius: 150,
  },
  blobs: {
    position: "absolute",
    top: 100,
  },
  btnContainer: {
    alignSelf: "flex-end",
    right: theme.space.contentPadding,
  },
})
