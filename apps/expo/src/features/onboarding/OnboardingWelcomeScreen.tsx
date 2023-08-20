import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { ViewStyle } from "react-native"
import { StyleSheet, View } from "react-native"

import { Button } from "~/design/components/Button"
import { SafeAreaView } from "~/design/components/SafeAreaView"
import { ScrollView } from "~/design/components/ScrollView"
import { Space } from "~/design/components/Space"
import { Text } from "~/design/components/Text"
import { rawPalette } from "~/design/palette"
import type { AppParams } from "~/navigation/params"

export const OnboardingWelcomeScreen: React.FC<
  NativeStackScreenProps<AppParams, "onboarding-welcome">
> = props => {
  const goToRegistration = () =>
    props.navigation.navigate("onboarding-registration")

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <SafeAreaView style={styles.safe} top>
          <Text variant="h2">Photonic</Text>
          <View style={styles.blobs}>
            {blobs.map(item => (
              <View key={item?.backgroundColor} style={[styles.blob, item]} />
            ))}
          </View>
          <View>
            <Text variant="h1">The open source photo backup app.</Text>
            <Space b={20} />
          </View>
        </SafeAreaView>
      </ScrollView>
      <ScrollView.StickyView style={styles.btnContainer}>
        <Button text={"Get started"} onPress={goToRegistration} />
      </ScrollView.StickyView>
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
  scrollContainer: {
    flexGrow: 1,
  },
  safe: {
    flex: 1,
    justifyContent: "space-between",
  },
  blob: {
    width: 150,
    height: 150,
    borderRadius: 150,
  },
  blobs: {
    position: "absolute",
    top: "20%",
  },
  btnContainer: {},
})
