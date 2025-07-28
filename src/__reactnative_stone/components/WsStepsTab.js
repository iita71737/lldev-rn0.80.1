import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import {
  WsBtn,
  WsTabView,
  WsProgress,
  WsText,
  WsFlex,
  WsIconBtn,
  SafeAreaView,
  WsPopup,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CheckListAssignmentStep from '@/sections/CheckList/CheckListAssignmentProcedure/Step'

const WsStepsTab = props => {
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    title = '',
    items,
    currentTabIndex,
    setCurrentTabIndex,
    iconColor = $color.gray5d,
    onSubmit,
    onChange = () => { },
    submitText = t('送出'),
    viewComponent,
    value = [],
    btnRightDisable,
    btnSubmitDisable,
    backBtnOnPress,
    swipeEnabled = true
  } = props

  // State
  const [popupActive, setPopupActive] = React.useState(false)
  const [tabItemsState, setTabItemsState] = React.useState(value)

  // Function
  const $_getItemsViews = () => {
    const _itemsViews = []
    items.forEach(tabItem => {
      _itemsViews.push({
        view: viewComponent
      })
    })
    return _itemsViews
  }

  const $_getItemsState = () => {
    const _itemsStates = items.map(tabItem => {
      return tabItem.props.value
    })
    return _itemsStates
  }

  const $_onChange = (itemIndex, $event, stateKey, item) => {
    onChange(itemIndex, $event, stateKey, item)
    const _tabItemsState = [...tabItemsState]
    if (!_tabItemsState[itemIndex]) {
      const _length = _tabItemsState.length
      for (let i = _length; i < itemIndex + 1; i++) {
        _tabItemsState[i] = {}
      }
    }
    _tabItemsState[itemIndex][stateKey] = $event
    setTabItemsState(_tabItemsState)
  }

  // Render
  return (
    <>
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
            alignItems: 'center',
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定返回嗎？')}
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
                backBtnOnPress()
                setPopupActive(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsTabView
        items={items}
        onChange={$_onChange}
        index={currentTabIndex}
        setIndex={setCurrentTabIndex}
        swipeEnabled={!btnRightDisable && swipeEnabled}
        TabBarRender={false}
        lazy={false}
        isAutoWidth={true}

        itemsState={$_getItemsState()}
        itemsViews={$_getItemsViews()}

        title={title}
        submitText={submitText}
        onSubmit={() => onSubmit(tabItemsState)}
        setPopupActive={setPopupActive}
      />
    </>
  )
}

export default WsStepsTab
