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
  WsGradientButton,
  WsBtn,
  WsInfo,
  WsPaddingContainer,
  WsState,
  WsSkeleton
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
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { FontWeight } from '@shopify/react-native-skia'

const MoreScopesSetting = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  const {
    selectedUser,
    refreshKey
  } = route.params

  // console.log(JSON.stringify(selectedUser),'selectedUser--');

  const _system_subclasses = selectedUser && selectedUser?.user_factory_system_subclass ? S_SystemClass.getSystemSubclassesBySubclassIds(selectedUser?.user_factory_system_subclass) : []

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUserScope = useSelector(state => state.data.userScopes)

  // STATE
  const [userData, setUserData] = React.useState({
    ...selectedUser,
    _system_subclasses: _system_subclasses
  })

  // Services
  const $_systemSubclassesOnChange = async ($event, item) => {
    const subClassIds = Array.isArray($event)
      ? $event.map(subClass => subClass.id)
      : $event.system_subclasses.map(subClass => subClass.id)
    if (Array.isArray($event)) {
      if (item.user_factory_system_subclasses) {
        S_UserFactorySystemSubclass.update({
          modelId: item.user_factory_system_subclasses.id,
          data: {
            system_classes:
              S_SystemClass.getSystemSubclassIdsBySubclassIds(subClassIds),
            system_subclasses: subClassIds
          }
        })
      } else {
        S_UserFactorySystemSubclass.create({
          parentId: item.id,
          data: {
            system_classes:
              S_SystemClass.getSystemSubclassIdsBySubclassIds(subClassIds),
            system_subclasses: subClassIds
          }
        })
      }
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16,
              }}
              onPress={() => {
              }}
            >
              {t('送出')}
            </WsBtn>
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
              if (refreshKey) {
                store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
              }
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  return (
    <>
      {userData ? (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsInfo
              labelWidth={72}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
              }}
              label={t('人員名稱')}
              value={userData?.name ? userData.name : t('無')}
            />
            <WsInfo
              labelWidth={72}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
              }}
              label={t('信箱')}
              type={'email'}
              value={userData?.email ? userData.email : t('無')}
            />
            <WsInfo
              labelWidth={72}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
              }}
              label={t('角色')}
              type={'belongstomany'}
              valueFontSize={14}
              value={userData?.user_factory_role_templates ? userData.user_factory_role_templates : t('無')}
            />
            <WsState
              style={{
                marginTop: 8,
              }}
              label={t('限閱領域')}
              placeholder={t('限閱領域')}
              type="modelsSystemClass"
              value={userData?._system_subclasses}
              onChange={$event => {
                // console.log($event, '$event--');
              }}
            />
            <WsState
              label={t('限閱轄下單位')}
              placeholder={t('請設定限閱轄下單位')}
              style={{
                marginTop: 16
              }}
              type="belongstomany002"
              nameKey={'name'}
              serviceIndexKey={'indexAll'}
              modelName={'factory'}
              value={userData?.user_organization_factory_scope}
              onChange={(e) => {
                console.log(e, 'eeeeee');
              }}
            />

            <WsState
              style={{
                marginTop: 8,
              }}
              label={t('角色權限')}
              placeholder={t('請選擇角色權限')}
              type="user_scopes"
              value={currentUserScope}
              onChange={$event => {
                // $_systemSubclassesOnChange($event, selectedUser)
              }}
            />
          </WsPaddingContainer>
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

export default MoreScopesSetting
