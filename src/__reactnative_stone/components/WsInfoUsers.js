import React from 'react'
import { WsFlex, WsInfoUser, WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { View, Modal, TouchableOpacity, Dimensions } from 'react-native'
import { useTranslation } from 'react-i18next'

const WsInfoUsers = props => {
    const { t, i18n } = useTranslation()

  // Props
  const {
    value = [],
    isUri,
    avatarSize,
    flexWrap = 'wrap',
    style,
    testID,
    avatarVisible,
    fontsize
  } = props

  // Render
  return (
    <>
      <View>
        {Array.isArray(value) && value.length > 0 ? (
          value.map((item, itemIndex) => (
            <WsInfoUser
              fontsize={fontsize}
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
          ))
        ) : (
          <WsText color={$color.black}>{t('無')}</WsText>
        )}
      </View>
    </>
  )
}

export default WsInfoUsers
