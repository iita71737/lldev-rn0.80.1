// OUO
import React from 'react'
import { WsUpdateBtn, WsStateFileItem } from '@/components'
import DocumentPicker from '@react-native-documents/picker'
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
      const response = await DocumentPicker.pick({})
      console.log(response,'response');
      onChange({
        lazyUri: response.uri,
        fileName: response.name,
        needUpload: true
      })
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {

      } else {
        throw err
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
