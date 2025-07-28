import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsGrid, WsInfoImage, WsText } from '@/components'
import { useTranslation } from 'react-i18next'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import $color from '@/__reactnative_stone/global/color'

const WsInfoImages = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const { value, style, label, emptyText } = props

  // Function
  const $_getFileName = url => {
    return S_Wasa.getFileNameFromUrl(url)
  }

  // Computed
  const $_formattedValue = () => {
    const _value = [...value]
    const _res = _value.map(item => {
      if (typeof item === 'string') {
        return item
      } else if (item !== null && typeof item === 'object') {
        // return item.source
        return item
      }
    })
    return _res
  }

  // Render
  return (
    <>
      {value && value.length > 0 ? (
        <View
          style={{
            alignItems: 'center',
          }}>
          <WsGrid
            style={{
            }}
            numColumns={3}
            renderItem={({ item, itemIndex }) => (
              <WsInfoImage fileName={$_getFileName(item)} value={item} />
            )}
            keyExtractor={(item, itemIndex) => `${item}-${itemIndex}`}
            data={$_formattedValue()}
          />
        </View>
      ) : (
        <View
          style={{
            paddingTop: 8
          }}
        >
          <WsText size={12} color={$color.gray}>{emptyText ? `(${emptyText})` : `${t('')} ${t(label)}`}</WsText>
        </View>
      )}
    </>
  )
}

export default WsInfoImages
