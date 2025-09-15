// OUO
import React from 'react'
import { WsUpdateBtn, WsGrid, WsStateFileItem, WsDes } from '@/components'
import { useTranslation } from 'react-i18next'
import { pick, types } from '@react-native-documents/picker'

const WsStateFiles = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = [],
    onChange,
    uploadUrl,
    uploadSuffix,
    modelName,
  } = props

  // Function
  const $_onUploadPress = async () => {
    try {
      const response = await pick({})
      const _value = [...value]
      response.forEach(responseItem => {
        _value.push({
          lazyUri: responseItem.uri,
          fileName: responseItem.name,
          needUpload: true
        })
      })
      onChange(_value)
    } catch (err) {
      // Android 有 code；iOS 可能只有 message
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')
      if (isCancel) {
        console.log('✅ 使用者取消選擇')
      } else {
        console.error('❌ 發生其他錯誤:', err)
      }
    }
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
      {value != '' && (
        <WsGrid
          numColumns={1}
          renderItem={({ item, itemIndex }) => (
            <>
              {item.lazyUri && (
                <WsStateFileItem
                  lazyUri={item.lazyUri}
                  fileType={item.fileType}
                  fileName={item.fileName}
                  needUpload={item.needUpload}
                  uploadUrl={uploadUrl}
                  uploadSuffix={uploadSuffix}
                  modelName={modelName}
                  onUploadComplete={$event => {
                    $_onUploadComplete($event, itemIndex)
                  }}
                />
              )}
              {!item.lazyUri && (
                <WsStateFileItem
                  value={item}
                  uploadUrl={uploadUrl}
                  uploadSuffix={uploadSuffix}
                  modelName={modelName}
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
      )}
      <WsUpdateBtn onPress={$_onUploadPress}>{t('上傳')}</WsUpdateBtn>
      <WsDes style={{ paddingTop: 8 }}>{`${t('檔案大小限制')} ≤ 30MB`}</WsDes>
    </>
  )
}

export default WsStateFiles
