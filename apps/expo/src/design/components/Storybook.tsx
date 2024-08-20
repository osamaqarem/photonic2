/* eslint-disable react-native/no-inline-styles */
import * as React from "react"
import type { TextProps } from "react-native"
import {
  FlatList,
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ButtonStory } from "~/expo/design/components/Button.story"
import { TextStory } from "~/expo/design/components/Text.story"
import { TextButtonStory } from "~/expo/design/components/TextButton.story"
import { TextInputStory } from "~/expo/design/components/TextInput.story"
import { IconsStory } from "~/expo/design/components/icons/icons.story"
import { rawPalette } from "~/expo/design/palette"
import { theme } from "~/expo/design/theme"
import {
  DarkModeProvider,
  useDarkMode,
} from "~/expo/providers/DarkModeProvider"

const components: Array<ComponentStory> = [
  TextInputStory,
  TextStory,
  ButtonStory,
  TextButtonStory,
  IconsStory,
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
  const {
    colorScheme,
    actions: { setMode },
  } = useDarkMode()

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
            style={{
              justifyContent: "center",
              height: 64,
            }}
            onPress={() => goToVariant(variantName)}>
            <StorybookText>{variantName}</StorybookText>
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
          keyboardDismissMode="interactive"
          contentContainerStyle={{
            padding: theme.space.contentPadding,
          }}
          keyExtractor={([name]) => name}
          renderItem={({ item }) => {
            const [name, Variant] = item
            return (
              <View
                style={{
                  marginTop: 40,
                }}>
                <StorybookText
                  style={{
                    color:
                      colorScheme === "dark"
                        ? rawPalette.violetDark.violet8
                        : rawPalette.violet.violet8,
                  }}>{`→ ${name}`}</StorybookText>
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
          <View
            style={{
              marginTop: 40,
            }}
          />
          <Variant />
        </>
      )
    }

    if (state.component.showSeparately) {
      return (
        <View
          style={{
            marginTop: 40,
          }}>
          <StorybookText
            style={{
              fontSize: 24,
              fontWeight: "bold",
            }}>
            {state.component.name}
            {state.variant ? (
              <StorybookText
                style={{
                  color: rawPalette.violet.violet4,
                }}>
                {" →"} {state.variant}
              </StorybookText>
            ) : null}
          </StorybookText>
          {state.variant ? renderVariant() : renderVariantNames()}
        </View>
      )
    } else {
      return (
        <>
          <StorybookText
            style={{
              fontWeight: "bold",
              fontSize: 24,
              marginTop: 32,
              marginLeft: 24,
            }}>
            {state.component.name}
          </StorybookText>
          {renderVariantsInline()}
        </>
      )
    }
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          paddingHorizontal: 32,
        }}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}>
          {Boolean(state) ? (
            <Pressable
              disabled={!Boolean(state)}
              style={{
                backgroundColor:
                  colorScheme === "light"
                    ? rawPalette.blue.blue10
                    : rawPalette.blueDark.blue8,
                alignItems: "center",
                borderRadius: 4,
                padding: 8,
              }}
              onPress={goBack}
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}>
              <StorybookText
                style={{
                  fontSize: 14,
                  color: "white",
                }}>
                Back
              </StorybookText>
            </Pressable>
          ) : (
            <StorybookText
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "300",
              }}>
              Storybook
            </StorybookText>
          )}
        </View>
        <Pressable
          style={{
            alignItems: "center",
            alignSelf: "flex-end",
            borderRadius: 4,
            backgroundColor: colorScheme === "light" ? "black" : "white",
            padding: 8,
          }}
          onPress={() => setMode(colorScheme === "light" ? "dark" : "light")}
          hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}>
          <StorybookText
            style={{
              color: colorScheme === "dark" ? "black" : "white",
              width: 96,
              fontSize: 14,
              textAlign: "center",
            }}>
            {`${colorScheme} mode`}
          </StorybookText>
        </Pressable>
      </View>

      <View
        style={{
          flex: 1,
        }}>
        {!state ? (
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginTop: 32,
              marginLeft: 24,
              color: colorScheme === "light" ? "black" : "white",
            }}>
            Components
          </Text>
        ) : null}
        {state ? (
          renderStory()
        ) : (
          <FlatList
            ItemSeparatorComponent={Separator}
            data={components}
            contentContainerStyle={{
              padding: theme.space.contentPadding,
            }}
            renderItem={row => {
              return (
                <>
                  <Pressable
                    style={{
                      flex: 1,
                      paddingVertical: 24,
                    }}
                    onPress={() => goToStory(row.item)}>
                    <StorybookText
                      style={{
                        fontSize: 16,
                      }}>
                      {row.index + 1}.
                      <StorybookText
                        style={{
                          fontSize: 18,
                          fontWeight: "500",
                        }}>
                        {"  " + row.item.name}
                      </StorybookText>
                    </StorybookText>
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
      style={{
        height: StyleSheet.hairlineWidth,
        width: "100%",
        backgroundColor: "lightgray",
      }}
    />
  )
}

function StorybookText({ style, ...props }: TextProps) {
  const { colorScheme } = useDarkMode()
  return (
    <Text
      {...props}
      style={[{ color: colorScheme === "light" ? "black" : "white" }, style]}>
      {props.children}
    </Text>
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
