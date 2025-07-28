import React, { useCallback, useMemo, useRef } from 'react'
import { TouchableHighlight, View, StyleSheet } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetBackdrop
} from '@gorhom/bottom-sheet'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsBottomSheet = props => {
  // Props
  const {
    isActive,
    snapPoints = useMemo(() => ['25%', '50%'], []),
    onDismiss,
    onItemPress,
    items,
    dismissOnPanDown = true,
    enableContentPanningGesture = true,
    enableHandlePanningGesture = true,
    underlayColor = $theme == 'light' ? $color.primary11l : $color.primary11d
  } = props

  // Ref
  const bottomSheetModalRef = React.useRef(null)

  // Effect
  React.useEffect(() => {
    if (isActive) {
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
    }
  }, [isActive])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        animatedIndex={{
          value: 1,
        }}
      />
    ),
    []
  )

  // Render
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        enablePanDownToClose={true}
        onDismiss={onDismiss}
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        dismissOnPanDown={dismissOnPanDown}
        enableContentPanningGesture={enableContentPanningGesture}
        enableHandlePanningGesture={enableHandlePanningGesture}
        backdropComponent={renderBackdrop} // overlay
        handleIndicatorStyle={{ display: "none" }} //handlebar
        containerStyle={{
          zIndex: 9999, // 提高層級
          elevation: 10, // 針對 Android 提高顯示層級
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.contentContainer}>
          {items.map((item, itemIndex) => (
            <TouchableHighlight
              underlayColor={underlayColor}
              onPress={() => {
                onItemPress(item, itemIndex)
                bottomSheetModalRef.current?.dismiss()
                onDismiss()
              }}
              key={itemIndex}>
              <WsFlex
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 11
                }}>
                <WsIcon
                  color={item.color}
                  name={item.icon}
                  size={30}
                  style={{
                    marginRight: 8
                  }}
                />
                <WsText color={item.labelColor}>{item.label}</WsText>
              </WsFlex>
            </TouchableHighlight>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  }
})

export default WsBottomSheet
