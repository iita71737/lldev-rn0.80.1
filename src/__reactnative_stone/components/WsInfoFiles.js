import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsGrid, WsInfoFile, WsText } from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import S_url from '@/__reactnative_stone/services/app/url'

const WsInfoFiles = props => {
  const { width, height } = Dimensions.get('screen')
  const { t, i18n } = useTranslation()

  // Props
  const {
    value,
    style = {
      padding: 8
    },
    emptyText,
  } = props

  // Computed
  const $_formattedValue = () => {
    const _value = [...value]
    const _res = _value.map(item => {
      if (typeof item === 'string') {
        return item
      } else if (typeof item === 'object') {
        if (item.file_version) {
          return item.file_version?.source_url ? item.file_version?.source_url : item.file_version.name
        } else {
          return item.file?.source_url ? item.file?.source_url : item.file.name
        }
      }
    })
    return _res
  }

  // Render
  return (
    <>
      {value && value.length >= 0 ? (
        <WsGrid
          style={{
            width: width
          }}
          numColumns={1}
          renderItem={({ item, itemIndex }) => (
            <View
              style={{
                paddingTop: 8,
              }}>
              <WsInfoFile
                testID={`WsInfoFile-${itemIndex}`}
                value={item}
                fileName={
                  value[itemIndex]?.file_version?.name ? value[itemIndex]?.file_version?.name :
                    value[itemIndex]?.file?.name ? value[itemIndex]?.file?.name : item ? decodeURI(S_url.getFileName(item)) : undefined
                }
                fileType={
                  value[itemIndex]?.file?.file_type ? value[itemIndex]?.file?.file_type :
                    value[itemIndex]?.file_version?.file_type ? value[itemIndex]?.file_version?.file_type : undefined
                }
                fileVersion={
                  value[itemIndex]?.file?.version_number ? value[itemIndex]?.file?.version_number :
                    value[itemIndex]?.file_version?.version_number ? value[itemIndex]?.file_version?.version_number : ''
                }
                // disabled={
                //   // issue#1690
                //   typeof value[0] === 'string' ? false : value[itemIndex]?.file?.source_url == null ? true : false
                // }
                disabled={
                  typeof value[0] === 'string'
                    ? false
                    : !(value[itemIndex]?.file?.source_url || value[itemIndex]?.file_version?.source_url)
                }
              />
            </View>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
          data={$_formattedValue()}
        />
      ) : (
        <View
          style={{
            borderWidth: 1,
          }}
        >
          <WsText size={12} color={$color.gray}>{emptyText ? `(${emptyText})` : ``}</WsText>
        </View>
      )}
    </>
  )
}

export default WsInfoFiles
