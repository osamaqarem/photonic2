import { StyleSheet } from "react-native"
import {
  SafeAreaView as RNSafeAreaView,
  SafeAreaViewProps as RNSafeAreaViewProps,
} from "react-native-safe-area-context"
import { theme } from "src/design/theme"

export const SafeAreaView: React.FC<RNSafeAreaViewProps> = ({
  style,
  ...props
}) => <RNSafeAreaView {...props} style={[styles.bg, style]} />

const styles = StyleSheet.create({
  bg: {
    backgroundColor: theme.colors.background,
  },
})
