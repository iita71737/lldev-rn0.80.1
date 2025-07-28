import React from 'react'
import {
  WsUpdateBtn,
  WsGrid,
  WsStateImageItem,
  WsDes
} from '@/components'
import { launchImageLibrary } from 'react-native-image-picker'
import { useTranslation } from 'react-i18next'

const WsStateImages = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    onChange,
    value = [],
    uploadUrl,
    modelName,
    uploadToFileStore
  } = props

  // Function
  const $_onUploadPress = () => {
    const options = {
      mediaType: 'photo'
    }
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        onChange([
          ...value,
          {
            lazyUri: response.assets[0].uri,
            fileName: response.assets[0].fileName,
            needUpload: true
          }
        ])
      }
    })
  }
  const $_onRemove = index => {
    const _value = [...value]
    _value.splice(index, 1)
    onChange(_value)
  }
  const $_onUploadComplete = ($event, itemIndex) => {
    const _value = [...value]
    _value[itemIndex] = $event
    onChange(_value)
  }

  // Render
  return (
    <>
      <>
        <WsGrid
          numColumns={3}
          spacing={1}
          renderItem={({ item, itemIndex }) => (
            <>
              {item.lazyUri && (
                <WsStateImageItem
                  lazyUri={item.lazyUri}
                  fileName={item.fileName}
                  needUpload={item.needUpload}
                  modelName={modelName}
                  uploadToFileStore={uploadToFileStore}
                  uploadUrl={uploadUrl}
                  onUploadComplete={$event => {
                    $_onUploadComplete($event, itemIndex)
                  }}
                />
              )}
              {!item.lazyUri && (
                <WsStateImageItem
                  value={item}
                  uploadUrl={uploadUrl}
                  modelName={modelName}
                  uploadToFileStore={uploadToFileStore}
                  onRemove={() => {
                    $_onRemove(itemIndex)
                  }}
                />
              )}
            </>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
          data={value}
        />
      </>
      <WsUpdateBtn onPress={$_onUploadPress}>{t('上傳')}</WsUpdateBtn>
      <WsDes style={{ paddingTop: 8 }}>{`${t('檔案大小限制')} ≤ 30MB`}</WsDes>
    </>
  )
}

export default WsStateImages
