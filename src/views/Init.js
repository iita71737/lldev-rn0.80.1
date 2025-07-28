import React from 'react'
import { ScrollView, View, StatusBar, SafeAreaView, Alert, Modal } from 'react-native'
import { WsLoadingView, WsLoadingImageSwitch } from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import S_Init from '@/__reactnative_stone/services/app/Init'
import S_SystemClass from '@/services/api/v1/system_class'
import S_ContractorType from '@/services/api/v1/contractor_type'
import S_CustomContractorType from '@/services/api/v1/contractor_customized_type'
import S_ActType from '@/services/api/v1/act_type'
import S_ActStatus from '@/services/api/v1/act_status'
import store from '@/store'
import {
  setSystemClasses,
  setEffect,
  setActType,
  setCollectIds,
  setCurrentFactory,
  setUserSubTasks,
  setUserScopes,
  setCurrentOrganization,
  setContractorTypes,
  setContractorCustomTypes,
  setAllContractorTypes,
  setActStatus,
  setFactoryTags,
  setContractor,
  setLicenseType,
  setEventTypes,
} from '@/store/data'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
// import { langWithApiAndLocal } from '@/__reactnative_stone/global/i18n'
import i18next from 'i18next'
import G_i18n from '@/__reactnative_stone/global/i18n'
import $s from '@/__reactnative_stone/services'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import S_Factory from '@/services/api/v1/factory'
import { setCurrentViewMode } from '@/store/data'
import S_FactoryTag from '@/services/api/v1/factory_tag'
import S_Contractor from '@/services/api/v1/contractor'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import S_LicenseType from '@/services/api/v1/license_type'
import S_EventType from '@/services/api/v1/event_type'

const InitView = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )

  // States
  const [initFactory, setInitFactory] = React.useState()
  const [initOrganization, setInitOrganization] = React.useState()

  // Storage
  const $_getStorage = async () => {
    const _factory = await AsyncStorage.getItem('factory')
    if (_factory) {
      setInitFactory(JSON.parse(_factory))
    }
    const _organization = await AsyncStorage.getItem('organization')
    if (_organization) {
      setInitOrganization(JSON.parse(_organization))
    }
  }

  const $_AuthCheckInit = async () => {
    try {
      const isAuthPass = await S_Init.authCheck()
      console.log(isAuthPass, 'isAuthPass');
      setTimeout(() => {
        S_Init.routeSet(navigation, isAuthPass)
      }, 1000)
    } catch (error) {
      console.log(error, '$_AuthCheckInit error')
    }
  }

  React.useEffect(() => {
    $_getStorage()
  }, [])

  React.useEffect(() => {
    // 驗證使用者後導向
    $_AuthCheckInit()
  }, [])

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <WsLoadingImageSwitch
        items={[
          require('@/assets/img/loading-1.png'),
          require('@/assets/img/loading-2.png'),
          require('@/assets/img/loading-3.png')
        ]}
        text={t('資料同步中，稍等喔')}
      />
    </>
  )
}

export default InitView
