import * as React from "react"
import {
  FlatList,
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
} from "react-native"
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context"

import { DarkModeProvider } from "src/stores/dark-mode/DarkModeProvider"
import { useDarkMode } from "src/stores/dark-mode/useDarkMode"
import { BlurButtonStory } from "./Blur.story"
// import { DropdownMenuStory } from "../dropdown-menu/dropdown-menu.story"
import { IconsStory } from "./icons/Icons.story"
import { TextInputStory } from "./TextInput.story"
import { TextStory } from "./Text.story"
import { View } from "./View"

const components: Array<ComponentStory> = [
  TextInputStory,
  TextStory,
  BlurButtonStory,
  IconsStory,
  // DropdownMenuStory, // FIXME: zeego web react jsx transform
]

export interface ComponentStory {
  name: string
  stories: Record<string, React.FC>
  showSeparately?: boolean
}

interface State {
  variant: string | null
  component: ComponentStory
}

const StorybookApp: React.FC = () => {
  const { isDarkMode, setDark, setLight } = useDarkMode()

  const { bottom } = useSafeAreaInsets()

  const [state, actualSetState] = React.useState<Nullable<State>>(null)
  const prevState = React.useRef<Array<State>>([])

  const setState = (...args: Parameters<typeof actualSetState>) => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 100,
    })
    return actualSetState(...args)
  }

  React.useEffect(function setPrevState() {
    if (!state) return
    prevState.current.push(state)
  })

  React.useEffect(function rehydrateReferences() {
    if (!state) return
    setState(currState => {
      if (!currState) return null
      return {
        component:
          components.find(
            component => component.name === currState.component.name,
          ) ?? currState.component,
        variant: currState.variant ? currState.variant : null,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goBack = () => {
    if (!state) return
    if (state.variant)
      setState(prev => (prev ? { ...prev, variant: null } : null))
    else if (state.component) setState(null)
  }

  const goToStory = (component: ComponentStory) => {
    setState({ component, variant: null })
  }

  const goToVariant = (variant: string) => {
    setState(state => (state ? { ...state, variant } : null))
  }

  const renderStory = () => {
    if (!state) return null

    const renderVariantNames = () => {
      const keys = Object.keys(state.component.stories)
      return keys.map((variantName, index) => (
        <View key={variantName}>
          <Pressable
            className="h-16 justify-center"
            onPress={() => goToVariant(variantName)}>
            <Text className="text-black dark:text-white">{variantName}</Text>
          </Pressable>
          {keys.length - 1 === index ? null : <Separator />}
        </View>
      ))
    }

    const renderVariantsInline = () => {
      if (!state) return null
      return (
        <FlatList
          data={Object.entries(state.component.stories)}
          contentContainerStyle={{
            paddingBottom: bottom,
          }}
          keyExtractor={([name]) => name}
          renderItem={({ item }) => {
            const [name, Variant] = item
            return (
              <View className="mt-10">
                <Text className="text-violet-600 dark:text-violet-400">{`→ ${name}`}</Text>
                <Variant />
              </View>
            )
          }}
        />
      )
    }

    const renderVariant = () => {
      if (!state) return null
      const Variant =
        state.component.stories[state.variant as keyof typeof state.component]
      if (!Variant) return null
      return (
        <>
          <View className="mt-10" />
          <Variant />
        </>
      )
    }

    if (state.component.showSeparately) {
      return (
        <View className="mt-10">
          <Text className="text-2xl font-bold text-black dark:text-white">
            {state.component.name}
            {state.variant ? (
              <Text className="text-violet-400">
                {" →"} {state.variant}
              </Text>
            ) : null}
          </Text>
          {state.variant ? renderVariant() : renderVariantNames()}
        </View>
      )
    } else {
      return (
        <>
          <Text className="text-2xl font-bold text-black dark:text-white">
            {state.component.name}
          </Text>
          {renderVariantsInline()}
        </>
      )
    }
  }

  return (
    <SafeAreaView className=" flex-1 bg-gray-100 dark:bg-black-800">
      <View className="w-full flex-row items-center justify-between px-8">
        <View className="items-center justify-center">
          {Boolean(state) ? (
            <Pressable
              disabled={!Boolean(state)}
              className="items-center rounded bg-blue-500 p-2 dark:bg-blue-700"
              onPress={goBack}
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}>
              <Text className="text-sm text-white">Back</Text>
            </Pressable>
          ) : (
            <Text className="text-center text-lg font-light tracking-wide text-black dark:text-white">
              hobo storybook
            </Text>
          )}
        </View>
        <Pressable
          className="items-center self-end rounded bg-black p-2 dark:bg-white"
          onPress={isDarkMode ? setLight : setDark}
          hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}>
          <Text className="w-24 text-center text-sm text-white dark:text-black">
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 p-10">
        {!state ? (
          <Text className="text-2xl font-bold text-black dark:text-white">
            Components
          </Text>
        ) : null}
        {state ? (
          renderStory()
        ) : (
          <FlatList
            ItemSeparatorComponent={Separator}
            data={components}
            renderItem={row => {
              return (
                <>
                  <Pressable
                    className="flex-1 py-6"
                    onPress={() => goToStory(row.item)}>
                    <Text className="text-base text-black dark:text-white">
                      {row.index + 1}.
                      <Text className="text-lg font-medium text-black dark:text-white">
                        {"  " + row.item.name}
                      </Text>
                    </Text>
                  </Pressable>
                </>
              )
            }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

function Separator() {
  return (
    <View
      className="w-full bg-gray-300"
      style={{
        height: StyleSheet.hairlineWidth,
      }}
    />
  )
}

export const Storybook = () => {
  return (
    <DarkModeProvider>
      <SafeAreaProvider>
        <StorybookApp />
      </SafeAreaProvider>
    </DarkModeProvider>
  )
}
