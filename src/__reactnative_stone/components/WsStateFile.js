// OUO
import React from 'react'
import { WsUpdateBtn, WsStateFileItem } from '@/components'
import { pick, types } from '@react-native-documents/picker'
import { useTranslation } from 'react-i18next'

const WsStateFile = props => {
  // Props
  const {
    value,
    onChange,
    uploadUrl
  } = props

  // i18n
  const { t, i18n } = useTranslation()

  // Function
  const $_onUploadPress = async () => {
    try {
      const response = await pick({})
      console.log(response, 'response');
      onChange({
        lazyUri: response.uri,
        fileName: response.name,
        needUpload: true
      })
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

  const $_onUploadComplete = $event => {
    const _value = $event
    onChange(_value)
  }

  const $_onRemove = () => {
    onChange()
  }

  // Render
  return (
    <>
      <WsUpdateBtn onPress={$_onUploadPress}>{t('上傳')}</WsUpdateBtn>
      {value && (
        <>
          {value.lazyUri && (
            <WsStateFileItem
              lazyUri={value.lazyUri}
              fileType={value.fileType}
              fileName={value.fileName}
              needUpload={value.needUpload}
              uploadUrl={uploadUrl}
              onRemove={$_onRemove}
              onUploadComplete={$event => {
                $_onUploadComplete($event)
              }}
            />
          )}
          {!value.lazyUri && (
            <WsStateFileItem
              value={value}
              uploadUrl={uploadUrl}
              onRemove={$_onRemove}
            />
          )}
        </>
      )}
    </>
  )
}

export default WsStateFile
