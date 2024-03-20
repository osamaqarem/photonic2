import "react-native-gesture-handler"
import "~/expo/lib/nanoid-shim"
import "~/expo/lib/base64-shim"
import { registerRootComponent } from "expo"

import App from "./App"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
