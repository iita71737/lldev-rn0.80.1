import React from 'react'
import { LlNavButton001 } from '@/components'
import { Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import S_License from '@/services/api/v1/license'
import S_Event from '@/services/api/v1/event'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_Training from '@/services/api/v1/training'
import S_Task from '@/services/api/v1/task'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import config from '@/__config'

const SettingIndex = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  return (
    <>

      {/* <LlNavButton001 iconLeft="ws-outline-staff-outline" onPress={() => {}}>
          {i18next.t('個人帳號設定')}
        </LlNavButton001> */}


      {/* <LlNavButton001
        iconLeft="ll-esh-labor"
        onPress={() => {
          navigation.navigate('RoutesUsers', {
            screen: 'UsersIndex'
          })
        }}>
        {i18next.t('成員管理')}
      </LlNavButton001> */}


      {/* <LlNavButton001
          iconLeft="ws-outline-role-setting"
          onPress={() => {
            navigation.navigate('RoutesUsers', {screen: 'RolesIndex'})
          }}>
          {i18next.t('角色管理')}
        </LlNavButton001> */}


      {/* <LlNavButton001 iconLeft="ws-outline-factory" onPress={() => {}}>
          {i18next.t('工廠設定')}
        </LlNavButton001> */}

      <LlNavButton001
        iconLeft="md-language"
        onPress={() => {
          navigation.navigate('RoutesMenu', { screen: 'SettingLanguage' })
        }}>
        {i18next.t('語言')}
      </LlNavButton001>

      <LlNavButton001
        iconLeft="md-language"
        onPress={() => {
          navigation.navigate('RoutesMenu', { screen: 'SettingTranslation' })
        }}>
        {i18next.t('自設文案管理')}
      </LlNavButton001>

    </>
  )
}

export default SettingIndex
