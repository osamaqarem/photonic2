import { FlashList } from "@shopify/flash-list"
import * as Haptics from "expo-haptics"
import * as ExpoStatusBar from "expo-status-bar"
import * as React from "react"
import {
  View,
  LayoutRectangle,
  useWindowDimensions,
  ViewStyle,
} from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "~/design/components/TextOld"
import type { GenericAsset } from "~/features/photo/list/models/asset"
import { useDarkMode } from "~/stores/DarkModeProvider"
import { useSharedValueContext } from "../context/SharedValueContext"
import { BottomPanel } from "./control-panel/Bottom"
import { Thumbnail } from "./Thumbnail"

interface Props {
  openPhoto: (asset: GenericAsset) => void
  assetList: GenericAsset[]
}

export const List: React.FC<Props> = props => {
  const { openPhoto, assetList } = props

  const {
    assetRecord,
    selectedItems,
    selectedItemsKeys,
    selectModeActive,
    showGradientOverlay,
  } = useSharedValueContext()

  const { colorScheme } = useDarkMode()

  const { width: deviceWidth } = useWindowDimensions()
  const { bottom: bottomInset, top: topInset } = useSafeAreaInsets()

  const headerHeight = 60
  const headerArea = topInset + headerHeight
  const numColumns = 3
  const numSeparators = numColumns - 1
  const columnSeparatorWidth = 0.01 * deviceWidth
  const imgWidth =
    (deviceWidth - columnSeparatorWidth * numSeparators) / numColumns
  const imgHeight = 125

  // Map of asset file names to the asset
  const flatlist = useAnimatedRef<FlashList<GenericAsset>>()
  const flatlistLayout = useSharedValue<Nullable<LayoutRectangle>>(null)

  const panTransitionFromIndex = useSharedValue<Nullable<number>>(null)
  const panY = useSharedValue<Nullable<number>>(null)

  const scrollContentHeight = useSharedValue(0)
  const scrollOffset = useSharedValue(0)

  const selectedAxisName = useSharedValue("")

  //#region gestures
  const longPressOnStart = (assetName: string) => {
    "worklet"
    const asset = assetRecord.value[assetName]
    if (!asset) return
    if (selectedItems.value[asset.name]) return
    const axis = { ...asset, isLongPressAxis: true }
    selectedAxisName.value = axis.name
    selectedItems.value = {
      ...selectedItems.value,
      [asset.name]: axis,
    }
  }

  const tapOnStart = (assetName: string) => {
    "worklet"
    const asset = assetRecord.value[assetName]
    if (!asset) return
    if (selectModeActive.value) {
      const item = selectedItems.value[assetName]
      if (item) {
        delete selectedItems.value[assetName]
        selectedItems.value = { ...selectedItems.value }
      } else {
        selectedItems.value = { ...selectedItems.value, [assetName]: asset }
      }
    } else {
      runOnJS(openPhoto)(asset)
    }
  }

  useAnimatedReaction(
    () => selectedItemsKeys.value.length,
    (next, prev) => {
      const prevVal = prev ?? 0
      if (next !== prevVal) {
        runOnJS(Haptics.selectionAsync)()
      }
    },
  )

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollOffset.value = event.contentOffset.y
    scrollContentHeight.value = event.contentSize.height

    if (event.contentOffset.y >= headerHeight / 2) {
      showGradientOverlay.value = true
      if (colorScheme === "light") {
        runOnJS(ExpoStatusBar.setStatusBarStyle)("light")
      }
    } else {
      showGradientOverlay.value = false
      if (colorScheme === "light") {
        runOnJS(ExpoStatusBar.setStatusBarStyle)("dark")
      }
    }
  })

  const scrollToOffset = (offset: number) => {
    flatlist.current?.scrollToOffset({ offset, animated: false })
  }

  const panScrollFrameCb = useFrameCallback(() => {
    if (
      !selectModeActive.value ||
      typeof panY.value !== "number" ||
      !flatlistLayout.value
    ) {
      return
    }
    const windowHeight = flatlistLayout.value.height
    const bottomThreshold = windowHeight * 0.85 - BottomPanel.bottomPanelHeight
    const topThreshold = windowHeight * 0.15
    if (panY.value > bottomThreshold) {
      const inputRange = [bottomThreshold, windowHeight]
      const outputRange = [0, 40]
      const result = interpolate(panY.value, inputRange, outputRange)
      const offset = scrollOffset.value + result
      runOnJS(scrollToOffset)(offset)
    } else if (scrollOffset.value > 0 && panY.value < topThreshold) {
      const inputRange = [topThreshold, 0]
      const outputRange = [0, 40]
      const result = interpolate(panY.value, inputRange, outputRange)
      const offset = scrollOffset.value - result
      runOnJS(scrollToOffset)(offset)
    }
  }, false)

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(Thumbnail.longPressTiming)
    .onStart(() => {
      runOnJS(panScrollFrameCb.setActive)(true)
    })
    .onUpdate(e => {
      if (!selectModeActive.value || !flatlistLayout.value) return
      panY.value = e.y

      const windowHeight = flatlistLayout.value.height

      const cellHeight = imgHeight + rowSeparatorHeight
      const cellWidth = imgWidth + columnSeparatorWidth

      const numItemsYAxis = Math.ceil(windowHeight / cellHeight)
      const numItemsXAxis = numColumns

      // account for top padding
      const topOffset = Math.max(0, headerArea - scrollOffset.value)
      const safeTopPanY = e.y - topOffset
      if (safeTopPanY < 0) return // panning in top padding

      // account for bottom padding
      const safeScrollableWindow = Math.max(
        scrollContentHeight.value - windowHeight - bottomInset,
        0,
      )
      const safeAreaPanY =
        scrollOffset.value >= safeScrollableWindow
          ? Math.min(safeTopPanY, windowHeight - bottomInset)
          : safeTopPanY
      if (safeTopPanY !== safeAreaPanY) return // panning in bottom padding

      // account for a row item being cut-off when scroll offset not 0
      const headerHidden = scrollOffset.value >= headerArea
      const breakpointYoffset = headerHidden
        ? cellHeight -
          ((scrollOffset.value - topInset - headerHeight) % cellHeight)
        : 0

      let breakpointsY: Array<number> = [0]
      let breakpointsX: Array<number> = [0]
      if (breakpointYoffset) breakpointsY.push(breakpointYoffset)

      Array(numItemsYAxis)
        .fill(0)
        .forEach((_, index) => {
          breakpointsY.push((index + 1) * cellHeight + breakpointYoffset)
        })
      Array(numItemsXAxis)
        .fill(0)
        .forEach((_, index) => {
          breakpointsX.push((index + 1) * cellWidth + columnSeparatorWidth)
        })

      const getValueBounds = (
        value: number,
        list: Array<number>,
      ): [number, number] => {
        let idx = 0
        for (const breakpoint of list) {
          if (value >= breakpoint) {
            idx += 1
          } else {
            return [idx - 1, idx]
          }
        }
        return [idx - 1, idx]
      }

      let [lowerBoundY, upperBoundY] = getValueBounds(
        safeAreaPanY,
        breakpointsY,
      )
      let [lowerBoundX, upperBoundX] = getValueBounds(e.absoluteX, breakpointsX)
      const lowY = breakpointsY[lowerBoundY] ?? -1
      const highY = breakpointsY[upperBoundY] ?? -1
      const lowX = breakpointsX[lowerBoundX] ?? -1
      const highX = breakpointsX[upperBoundX] ?? -1

      const withinX = e.absoluteX >= lowX && e.absoluteX <= highX
      const withinY = safeAreaPanY >= lowY && safeAreaPanY <= highY

      if (withinY && withinX) {
        const scrolledRows = headerHidden
          ? Math.floor(Math.abs((headerArea - scrollOffset.value) / cellHeight))
          : 0
        const rowBeginsAtIndex = scrolledRows * numColumns

        const getArrayIndexForDimensions = (
          rowIndex: number,
          colIndex: number,
        ) => {
          const arraysStartAtZero = 1
          return (
            rowIndex * numColumns -
            (numColumns - colIndex) +
            rowBeginsAtIndex -
            arraysStartAtZero
          )
        }

        const itemIndex = getArrayIndexForDimensions(upperBoundY, upperBoundX)

        const getItemFromState = (index: number) => {
          const itemInState = assetList[index]
          return itemInState ? assetRecord.value[itemInState.name] : undefined
        }

        const item = getItemFromState(itemIndex)
        if (!item) return

        if (panTransitionFromIndex.value === null) {
          panTransitionFromIndex.value = itemIndex
        }

        /**
         * axis cell: the cell where the long-press starts.
         * next cell: the cell being entered
         * previous cell: the cell being left
         *
         * Algorithm:
         * - when entering a cell
         *    - select all cells between the axis and the next cell
         *
         *         - when the next cell row is before the axis row
         *              - deselect all cells after the axis
         *         - when the cell row is after the axis row
         *              - deselect all cells before the axis
         */
        const toIndex = itemIndex
        if (panTransitionFromIndex.value !== toIndex) {
          const selectItemAtIndex = (
            i: number,
            mutateObj: Record<string, GenericAsset>,
          ) => {
            const curr = getItemFromState(i)
            if (curr) {
              const existing = mutateObj[curr.name]
              if (!existing) {
                mutateObj[curr.name] = curr
              }
            }
          }
          const deselectItemAtIndex = (
            i: number,
            mutateObj: Record<string, GenericAsset>,
          ) => {
            const curr = getItemFromState(i)
            if (curr) {
              const existing = mutateObj[curr.name]
              if (existing && existing.name !== selectedAxisName.value) {
                delete mutateObj[curr.name]
              }
            }
          }

          const fromIndex = panTransitionFromIndex.value

          const axisItem = selectedItems.value[selectedAxisName.value]
          const axisIndex = assetList.findIndex(
            asset => asset.name === axisItem?.name,
          )

          const axisRow = Math.floor(axisIndex / numColumns) + 1
          const toRow = Math.floor(itemIndex / numColumns) + 1

          const afterAxisRow = toRow > axisRow
          const isAxisRow = toRow === axisRow

          const backwards = toIndex < fromIndex
          const forwards = toIndex > fromIndex

          let nextSelectedItemsState = { ...selectedItems.value }

          if (axisRow) {
            if (forwards) {
              for (let i = fromIndex; i < toIndex; i++) {
                deselectItemAtIndex(i, nextSelectedItemsState)
              }
            } else if (backwards) {
              for (let i = fromIndex; i > toIndex; i--) {
                deselectItemAtIndex(i, nextSelectedItemsState)
              }
            }
          }

          if (afterAxisRow || (isAxisRow && forwards)) {
            for (let i = axisIndex; i <= toIndex; i++) {
              selectItemAtIndex(i, nextSelectedItemsState)
            }
          } else if (!afterAxisRow || (isAxisRow && backwards)) {
            for (let i = axisIndex; i >= toIndex; i--) {
              selectItemAtIndex(i, nextSelectedItemsState)
            }
          }
          selectedItems.value = nextSelectedItemsState
        }
        panTransitionFromIndex.value = toIndex
      }
    })
    .onEnd(() => {
      panTransitionFromIndex.value = null
      panY.value = null
      runOnJS(panScrollFrameCb.setActive)(false)
    })
  //#endregion gestures

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(selectModeActive.value ? 0 : 1, {
      duration: 200,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  }))

  const renderItem = (row: { item: GenericAsset; index: number }) => {
    return (
      <Thumbnail
        asset={row.item}
        onPress={openPhoto}
        tapOnStart={() => tapOnStart(row.item.name)}
        longPressOnStart={() => longPressOnStart(row.item.name)}
        simultaneousWithExternalGesture={panGesture}
        height={imgHeight}
        width={imgWidth}
      />
    )
  }

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedFlashList
        estimatedItemSize={Math.min(
          imgHeight - rowSeparatorHeight,
          imgWidth - columnSeparatorWidth,
        )}
        ref={flatlist}
        data={assetList}
        renderItem={renderItem}
        numColumns={numColumns}
        onScroll={scrollHandler}
        keyExtractor={keyExtractor}
        onLayout={e => {
          flatlistLayout.value = e.nativeEvent.layout
        }}
        contentContainerStyle={{
          paddingBottom: bottomInset + BottomPanel.bottomPanelHeight,
        }}
        ItemSeparatorComponent={RowSeparatorComponent}
        ListHeaderComponent={
          <ListHeaderComponent
            height={headerArea}
            headerAnimatedStyle={headerAnimatedStyle}
          />
        }
      />
    </GestureDetector>
  )
}

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList<GenericAsset>,
)

const keyExtractor = (item: GenericAsset) => item.name

const rowSeparatorHeight = 4
const RowSeparatorComponent: React.FC = () => (
  <View style={{ height: rowSeparatorHeight }} />
)

interface ListHeaderProps {
  height: number
  headerAnimatedStyle: ViewStyle
}
const ListHeaderComponent: React.FC<ListHeaderProps> = ({
  height,
  headerAnimatedStyle,
}) => {
  return (
    <Animated.View style={[{ height: height }, headerAnimatedStyle]}>
      <View style={{ marginTop: height / 2 }} className="pl-2">
        <Text intent="header" size="h2">
          photos
        </Text>
      </View>
    </Animated.View>
  )
}
