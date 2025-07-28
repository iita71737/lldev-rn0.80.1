import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'

const WsShadowCard = props => {

  // Props
  const {
    children,
    onPress,
    style,
    disabled,
    testID
  } = props

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled}
      onPress={onPress}
    >
      <View
        style={[
          {
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: '#ffffff',
            shadowColor: '#000',
            shadowOffset: {
              width: 2,
              height: 4
            },
            borderRadius: 10,
            shadowRadius: 4,
            shadowOpacity: 0.25,
            elevation: 2
          },
          style
        ]}>
        {children}
      </View>
    </TouchableOpacity>
  )
}

export default WsShadowCard
