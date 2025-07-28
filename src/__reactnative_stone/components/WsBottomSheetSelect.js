import React from 'react'
import { TouchableHighlight, View, Image } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsBottomSheetSelect = props => {
  // Props
  const {
    isActive,
    snapPoints = [148, 148],
    onDismiss,
    onItemPress,
    items,
    dismissOnPanDown = true,
    enableContentPanningGesture = true,
    enableHandlePanningGesture = true,
    underlayColor = $theme == 'light' ? $color.primary11l : $color.primary11d
  } = props

  // Ref
  const bottomSheetModalRef = React.useRef()

  // Effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isActive) {
        bottomSheetModalRef.current?.present()
      } else {
        bottomSheetModalRef.current?.dismiss()
      }
    }, 100)

    return () => {
      clearTimeout(timer); // 清除定时器
    };
  }, [isActive])

  // Render
  return (
    <BottomSheetModalProvider>
      <View>
        <BottomSheetModal
          onDismiss={onDismiss}
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          dismissOnPanDown={dismissOnPanDown}
          enableContentPanningGesture={enableContentPanningGesture}
          enableHandlePanningGesture={enableHandlePanningGesture}>
          <BottomSheetScrollView>
            {items.map((item, itemIndex) => (
              <TouchableHighlight
                underlayColor={underlayColor}
                onPress={() => {
                  onItemPress(item, itemIndex)

                  // bottomSheetModalRef.current?.dismiss();
                  // onDismiss();
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
                  <WsText>{item.label}</WsText>
                  {item.checked && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 15
                      }}>
                      <Image
                        size={50}
                        source={require('@/__reactnative_stone/assets/img/iconCheck.png')}
                      />
                    </View>
                  )}
                </WsFlex>
              </TouchableHighlight>
            ))}
          </BottomSheetScrollView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  )
}

export default WsBottomSheetSelect
