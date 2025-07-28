import React, { useState } from 'react'
import {
  SafeAreaView,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert
} from 'react-native'
import {
  WsIcon,
  WsText,
  WsFlex,
  WsLoading,
  WsTabView,
  WsPopup,
  WsStateFormView,
  LlFileStoreStateFormView,
  LlPopupAlert,
  WsGradientButton
} from '@/components'
import { images } from '@/__reactnative_stone/assets/img'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import $config from '@/__config'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import S_FileFolder from '@/services/api/v1/file_folder'
import TabUploadFromFileStore from '@/views/File/TabUploadFromFileStore'
import TabUploadFromLocalFile from '@/views/File/TabUploadFromLocalFile'
import TabUploadFromOtherFileStore from '@/views/File/TabUploadFromOtherFileStore'
import LlFIleFolderMoveView from '@/views/File/LlFIleFolderMoveView'
import { useTranslation } from 'react-i18next'

const LlRelatedActModalPickerStep2 = props => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  const {
    isVisible,
    onClose,
    fields,
    value,
    onChange,
    fetchItems,
    setFetchItems
  } = props

  // FUNCTION
  const $_onChange = (fieldsValue) => {
    if (fieldsValue.specific_article && (fieldsValue.specific_article.length > 0)) {
      const _fetchItems = [...fetchItems, ...fieldsValue.specific_article]
      setFetchItems(_fetchItems)
      onChange(_fetchItems)
      onClose()
    } else {
      const _fetchItems = [...fetchItems, { ...fieldsValue.act }]
      setFetchItems(_fetchItems)
      onChange(_fetchItems)
      onClose()
    }
  }

  return (
    <>
      <WsPopup
        active={isVisible}
        onClose={() => {
          onClose()
        }}
      >
        <SafeAreaView>
          <View
            style={{
              width: width,
              height: height * 0.9,
              backgroundColor: $color.white,
              borderRadius: 10,
              paddingTop: 16,
            }}>
            <>
              {fields && (
                <LlFileStoreStateFormView
                  fields={fields}
                  onChange={(fieldsValue) => {
                    $_onChange(fieldsValue)
                  }}
                  initValue={value}
                  onClose={onClose}
                />
              )}
            </>
          </View>
        </SafeAreaView>
      </WsPopup>
    </>


  )
}
export default LlRelatedActModalPickerStep2
