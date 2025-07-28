import React from 'react'
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  Platform,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native'
import layouts from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import {
  WsModalHeader,
  WsModalFooter,
  WsBtn,
  WsText,
  WsFlex,
  WsIcon
} from '@/components'

const WsBottomModal = props => {
  // Props
  const {
    items,
    isActive,
    children,
    onDismiss,
    underlayColor,
    modalHeight = '25%',
    visible = false,
    onClose,
    borderTopRightRadius = 20,
    borderTopLeftRadius = 20,
    animationType = 'slide',
    onItemPress
  } = props

  const bottomSheetModalRef = React.useRef()

  // Effect
  React.useEffect(() => {
    if (isActive) {
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
    }
  }, [isActive])

  return (
    <>
      <Modal
        animationType={animationType}
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          onClose()
        }}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onPress={() => {
            onClose()
          }}
        />
        <View
          style={{
            height: modalHeight,
            marginTop: 'auto',
            backgroundColor: 'transparent'
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: $color.white,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              borderTopRightRadius: borderTopRightRadius,
              borderTopLeftRadius: borderTopLeftRadius
            }}>
            {/* {children} */}
            {items.map((item, itemIndex) => (
              <TouchableHighlight
                underlayColor={underlayColor}
                onPress={() => {
                  onItemPress(item, itemIndex)
                  // bottomSheetModalRef.current?.dismiss();
                  // onDismiss()
                }}
                key={itemIndex}
                style={[
                  itemIndex == 0
                    ? {
                      paddingTop: 11
                    }
                    : null
                ]}>
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
                </WsFlex>
              </TouchableHighlight>
            ))}
          </View>
        </View>
      </Modal>
    </>
  )
}

export default WsBottomModal
