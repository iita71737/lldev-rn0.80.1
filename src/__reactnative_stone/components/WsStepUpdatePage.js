import React from 'react'
import { Alert, View, Dimensions, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsStateFormView,
  WsLoading,
  WsPopup,
  WsText,
  WsGradientButton,
  WsFlex
} from '@/components'
import Services from '@/services/api/v1/index'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_LicenseVersion from '@/services/api/v1/license_version'
import S_License from '@/services/api/v1/license'
import S_InternalTraining from '@/services/api/v1/training'
import S_Contractor from '@/services/api/v1/contractor'
import { useIsFocused } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setDataForEditEvent,
  setUpdateDataForEditEvent,
  setFieldForForm,
  setCurrentEditLicense,
  setCurrentEditTraining,
  setCurrentCheckListForEdit,
  setCurrentCheckListForUpdateVersion,
  setCurrentContractorBasicData
} from '@/store/data'
import $color from '@/__reactnative_stone/global/color'

const WsStepUpdatePage = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  // i18n
  const { t, i18n } = useTranslation()

  // Variable
  const isFocused = useIsFocused()

  // Params
  const {
    fields,
    stepSetting,
    currentPage,
    totalPages,
    name,
    modelId,
    versionId,
    currentUserId,
    parentId,
    modelName,
    afterFinishingTo,
    afterFinishingParams,
    submitFunction,
    extraParams,
    headerRightBtnText002,
    onSubmitDraft
  } = route.params

  // States
  const [popupActive, setPopupActive] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [value, onChange] = React.useState({})

  // Storage
  const $_setStorage = async () => {
    const _value = JSON.stringify(value)
    await AsyncStorage.setItem(name, _value)
  }
  const $_clearStorage = async () => {
    await AsyncStorage.removeItem(name)
  }

  // Services
  const $_fetchApi = async () => {
    const res = await Services[modelName].show({
      modelId: modelId
    })
  }

  // Function
  const $_getStepFields = showFields => {
    let _fields = {}
    for (let key in fields) {
      showFields.forEach(showField => {
        if (key == showField) {
          _fields = {
            ..._fields,
            [key]: fields[key]
          }
        }
      })
    }
    return _fields
  }

  const $_getFields = () => {
    if (stepSetting.getShowFields) {
      const filterFields = $_getStepFields(stepSetting.getShowFields(value))
      store.dispatch(setFieldForForm(filterFields))
      return $_getStepFields(stepSetting.getShowFields(value))
    } else if (stepSetting.showFields) {
      return $_getStepFields(stepSetting.showFields)
    } else {
      return fields
    }
  }

  const $_onChange = $event => {
    // 250318-fix-issues
    onChange((prev) => ({
      ...prev,
      ...Object.keys($event).reduce((acc, key) => {
        // **只更新有變更的值**
        if ($event[key] !== undefined && $event[key] !== null) {
          acc[key] = $event[key];
        }
        return acc;
      }, {})
    }));
    $_setStorage((prev) => ({
      ...prev,
      ...Object.keys($event).reduce((acc, key) => {
        // **只更新有變更的值**
        if ($event[key] !== undefined && $event[key] !== null) {
          acc[key] = $event[key];
        }
        return acc;
      }, {})
    }));
  }

  const $_onSubmit = async () => {
    if (currentPage != totalPages) {
      navigation.navigate({
        name: `${name}Step${currentPage + 1}`,
        params: {
          id: modelId,
          versionId: versionId
        }
      })
    } else {
      const _formattedValue = S_Wasa.getPostData(fields, value)
      if (submitFunction) {
        setLoading(true)
        submitFunction(
          _formattedValue,
          modelId,
          versionId,
          navigation,
          currentUserId,
          parentId,
          extraParams
        )
      }
    }
    $_setStorage()
  }

  // 250624-save draft
  const $_onSubmitDraft = async () => {
    const asyncValue = await AsyncStorage.getItem(name)
    const _value = JSON.parse(asyncValue)
    const _formattedValue = S_Wasa.getPostData(fields, _value)
    let _postData = {
      ..._formattedValue
    }
    if (onSubmitDraft) {
      onSubmitDraft(_postData, navigation, currentUserId)
    }
  }

  const $_onBack = async () => {
    setPopupActive(true)
  }

  const $_setValueFromStorage = async () => {
    const value = await AsyncStorage.getItem(name)
    const _value = JSON.parse(value)
    onChange(_value)
    if (currentPage == 1) {
      // $_fetchApi()
    }
  }

  React.useEffect(() => {
    if (isFocused) {
      $_setValueFromStorage()
      $_getFields()
    }
  }, [isFocused, route])

  React.useEffect(() => {
    $_setStorage(value)
  }, [value])

  // Render
  return (
    <>
      {loading ? (
        <WsLoading
          type="b"
          style={{
            flex: 1,
            backgroundColor: 'rgba(3,13,31,0.15)'
          }}
        />
      ) : (
        <>
          <WsStateFormView
            navigation={navigation}
            initValue={value}
            isNavigationOption={true}
            fields={$_getFields()}
            onChange={(e) => { $_onChange(e) }}
            headerRightBtnText={
              currentPage != totalPages ? t('下一步') : t('送出')
            }
            onSubmit={$_onSubmit}
            leftBtnOnPress={$_onBack}
            onSubmitDraft={$_onSubmitDraft}
            headerRightBtnText002={headerRightBtnText002}
          />
          <WsPopup
            active={popupActive}
            onClose={() => {
              setPopupActive(false)
            }}>
            <View
              style={{
                width: width * 0.9,
                height: height * 0.2,
                backgroundColor: $color.white,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <WsText
                size={18}
                color={$color.black}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 16
                }}
              >{t('確定捨棄嗎？')}
              </WsText>
              <WsFlex
                style={{
                  position: 'absolute',
                  right: 16,
                  bottom: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderWidth: 1,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    alignItems: 'center',
                    width: 110,
                    height: 48
                  }}
                  onPress={() => {
                    setPopupActive(false)
                  }}>
                  <WsText
                    size={14}
                    color={$color.gray}
                  >{t('取消')}
                  </WsText>
                </TouchableOpacity>
                <WsGradientButton
                  style={{
                    width: 110,
                  }}
                  onPress={() => {
                    $_clearStorage()
                    navigation.goBack()
                  }}>
                  {t('確定')}
                </WsGradientButton>
              </WsFlex>
            </View>
          </WsPopup>
        </>
      )}
    </>
  )
}

export default WsStepUpdatePage
