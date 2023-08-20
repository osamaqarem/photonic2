import { Text, Image as RNImage, StyleSheet, View } from "react-native"

import type { ComponentStory } from "~/design/components/Storybook"
import { BlurView } from "./Blur"

export const BlurButtonStory: ComponentStory = {
  name: "BlurView",
  stories: {
    default: () => (
      <View style={{ height: 200, width: 200 }}>
        <RNImage
          style={{ height: "100%", width: "100%" }}
          source={{
            uri: "https://s3.amazonaws.com/exp-icon-assets/ExpoEmptyManifest_192.png",
          }}
        />
        <BlurView
          intensity={20}
          style={StyleSheet.absoluteFill}
          className="items-center justify-center px-6">
          <Text className="text-lg text-white">
            I blur content with a lower z-index
          </Text>
        </BlurView>
      </View>
    ),
  },
}
