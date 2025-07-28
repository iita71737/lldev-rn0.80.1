import React, { useCallback } from 'react'
import {
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsStateFormView,
  WsText,
  WsFlex,
  WsTag,
  WsIconBtn,
  WsLoading,
  WsPopup,
  WsGradientButton
} from '@/components'
import Services from '@/services/api/v1/index'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import { useIsFocused } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import {
  setRefreshCounter,
} from '@/store/data'
import { useSelector } from 'react-redux'
import store from '@/store'

const WsStepCreatePage = ({ navigation, route }, props) => {
  // Dimension
  const { width, height } = Dimensions.get('window')
  // i18n
  const { t, i18n } = useTranslation()

  // Params
  const {
    fields,
    stepSetting,
    currentPage,
    totalPages,
    name,
    modelName,
    parentId,
    currentUserId,
    afterFinishingTo,
    afterFinishingParams,
    getFormatPostData,
    onSubmit,
    submitFunction,
    versionName,
    headerRightBtnText,
    headerRightBtnText002,
    onSubmitDraft
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // States
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupActive002, setPopupActive002] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [value, onChange] = React.useState({})

  // Variable
  const isFocused = useIsFocused()

  // Storage
  const $_setStorage = async value => {
    const _value = JSON.stringify(value)
    await AsyncStorage.setItem(name, _value)
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
      return $_getStepFields(stepSetting.getShowFields(value))
    } else if (stepSetting.showFields) {
      return $_getStepFields(stepSetting.showFields)
    } else {
      return fields
    }
  }

  const $_onChange = async $event => {
    const eventChangeData = { ...value, ...$event }
    onChange(eventChangeData)
    $_setStorage(eventChangeData)
  }

  const $_onSubmit = async () => {
    if (currentPage != totalPages) {
      navigation.navigate(`${name}Step${currentPage + 1}`)
    } else {
      const asyncValue = await AsyncStorage.getItem(name)
      const _value = JSON.parse(asyncValue)
      const _formattedValue = S_Wasa.getPostData(fields, _value)
      let _postData = {
        ..._formattedValue
      }
      if (getFormatPostData) {
        _postData = getFormatPostData(_postData)
      }
      if (submitFunction) {
        setLoading(true)
        submitFunction(_postData, navigation, currentUserId)
      } else {
        $_createData(_postData)
        navigation.navigate(afterFinishingTo)
      }
    }
  }

  // 250624-save draft
  const $_onSubmitDraft = async () => {
    const asyncValue = await AsyncStorage.getItem(name)
    const _value = JSON.parse(asyncValue)
    const _formattedValue = S_Wasa.getPostData(fields, _value)
    let _postData = {
      ..._formattedValue
    }
    // console.log(_postData,'_postData--');
    if (onSubmitDraft) {
      // setLoading(true)
      onSubmitDraft(_postData, navigation, currentUserId)
    }
  }

  const $_setValue = async () => {
    const asyncValue = await AsyncStorage.getItem(name)
    const _value = JSON.parse(asyncValue)
    onChange(_value)
  }

  const $_leftBtnOnPress = () => {
    if (currentPage != 1) {
      navigation.navigate(`${name}Step${currentPage - 1}`)
    } else {
      setPopupActive(true)
    }
  }

  const $_removeStorage = async () => {
    await AsyncStorage.removeItem(name)
  }

  // Services
  const $_createData = async data => {
    try {
      const res = await Services[modelName].create({
        data: data,
        parentId: parentId
      })
      if (versionName) {
        const createVersion = await Services[versionName].create({
          parentId: res.id
        })
      }
      return res
    } catch (e) {
      console.log(e.message, '===error===')
    }
  }

  // Effect
  React.useEffect(() => {
    if (isFocused) {
      $_setValue()
    }
  }, [isFocused])

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
        <WsStateFormView
          navigation={navigation}
          initValue={value}
          isNavigationOption={true}
          fields={$_getFields()}
          onChange={$_onChange}
          headerRightBtnText={
            headerRightBtnText ? headerRightBtnText : (currentPage != totalPages) ? t('下一步') : t('送出')
          }
          headerRightBtnText002={headerRightBtnText002}
          onSubmit={$_onSubmit}
          onSubmitDraft={$_onSubmitDraft}
          leftBtnOnPress={$_leftBtnOnPress}
        />
      )}

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
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              padding: 16,
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
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center',
                justifyContent: 'center',
                height: 48
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                style={{
                }}
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
                $_removeStorage()
                setPopupActive(false)
                navigation.goBack()
                // store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              padding: 16,
            }}
          >{t('確定儲存成草稿嗎？')}
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
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center',
                justifyContent: 'center',
                height: 48
              }}
              onPress={() => {
                setPopupActive002(false)
              }}>
              <WsText
                style={{
                }}
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

                // $_removeStorage()
                // setPopupActive(false)
                // navigation.goBack()
                // store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
              }}
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default WsStepCreatePage
