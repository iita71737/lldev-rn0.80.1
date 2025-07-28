import React from 'react'
import { WsFlex, WsInfoUser } from '@/components'
import { View, Modal, TouchableOpacity, Dimensions } from 'react-native'

const WsInfoUsers = props => {
  // Props
  const {
    value = [],
    isUri,
    avatarSize,
    flexWrap = 'wrap',
    style,
    testID,
    avatarVisible
  } = props

  // Render
  return (
    <>
      <View>
        {value &&
          value.length > 0 &&
          value.map((item, itemIndex) => (
            <WsInfoUser
              avatarVisible={avatarVisible}
              testID={`${testID}-${itemIndex}`}
              avatarSize={avatarSize}
              isUri={isUri}
              key={itemIndex}
              value={{
                avatar: item.avatar
                  ? item.avatar
                  : item.source
                    ? item.source
                    : null,
                name: item.name ? item.name : null,
                des: item.des ? item.des : null
              }}
              style={{
                marginRight: 24,
                marginVertical: 2,
                // borderWidth:1,
              }}
            />
          ))}
      </View>
    </>
  )
}

export default WsInfoUsers
