import React from 'react'
import { View } from 'react-native'
import { WsFlex, WsText, WsAvatar, WsDes, WsTag } from '@/components'
import { useTranslation } from 'react-i18next'

const WsInfoUser = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    fontsize = 14,
    avatarSize = 30,
    value,
    isUri = false,
    style,
    des = '',
    prefixDes,
    defaultValue,
    testID,
    avatarVisible = true
  } = props

  // Render
  return (
    <>
      <WsFlex style={style}>
        {value &&
          avatarVisible && (
            <>
              <WsAvatar
                isUri={isUri}
                size={avatarSize}
                source={value.avatar ? value.avatar : null}
                style={{
                  marginRight: 8,
                }}
              />
            </>
          )}
        {value && (
          <View
            style={{
            }}
          >
            <WsText size={fontsize} style={{}} testID={testID}>{value.name}</WsText>
            {(des != '' || value.des) && (
              <WsDes>{prefixDes ? prefixDes : ''}{des ? des : value.des}</WsDes>
            )}
          </View>
        )}
        {!value && <WsText size={fontsize}>{t('無')}</WsText>}
      </WsFlex>
    </>
  )
}

export default WsInfoUser
