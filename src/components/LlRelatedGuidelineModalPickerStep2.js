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
  // LlFileStoreStateFormView,
  LlRelatedGuidelineStateFormView001,
  LlPopupAlert,
  WsGradientButton,
  WsModal
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

const LlRelatedGuidelineModalPickerStep2 = props => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  const {
    step2ModalVisible,
    onClose,
    fields,
    value,
    onChange,
    fetchItems,
    setFetchItems,
    setStep2ModalVisible,
    setGuidelineModalVisible
  } = props

  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  // FUNCTION
  const $_onChange = (fieldsValue) => {
    let _fetchItems = [];
    if (fieldsValue.related_guidelines && fieldsValue.related_guidelines.length > 0) {
      // 綁定層級或條文
      _fetchItems = [...fetchItems, ...fieldsValue.related_guidelines];
    } else {
      // 綁定整部內規
      _fetchItems = [...fetchItems, fieldsValue];
    }
    // 過濾重複項目（根據 id 去重）
    const uniqueItems = _fetchItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id && t.bind_version === item.bind_version)
    );
    setFetchItems(uniqueItems);
    onChange(uniqueItems);
    onClose()
  }

  return (
    <>
      <WsPopup
        active={step2ModalVisible}
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
                <LlRelatedGuidelineStateFormView001
                  fields={fields}
                  onChange={(fieldsValue) => {
                    $_onChange(fieldsValue)
                  }}
                  initValue={value}
                  setStep2ModalVisible={setStep2ModalVisible}
                  setGuidelineModalVisible={setGuidelineModalVisible}
                />
              )}
            </>
          </View>
        </SafeAreaView>
      </WsPopup>
    </>
  )
}

export default LlRelatedGuidelineModalPickerStep2
