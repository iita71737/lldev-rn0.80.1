import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsIconBtn,
  WsToggleTabBar,
  WsBtn,
  WsPage,
  WsPage002
} from '@/components'
import AuditRecords from '@/sections/Audit/AuditRecords'
import AuditList from '@/sections/Audit/AuditList'
import LlToggleTabBar001 from '@/components/LlToggleTabBar001'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import AuditTemplateList from '@/views/Audit/Template/AuditTemplateList'
import AuditCollectList from '@/sections/Audit/AuditCollectList'
import { useSelector } from 'react-redux'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AuditTemplateSystemClasses from '@/views/Audit/Template/AuditTemplateSystemClasses'

interface AuditIndexProps {
  route: any;
  navigation: any;
}

const AuditIndex: React.FC<AuditIndexProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const _tabIndex = route.params?.tabIndex

  const [tabIndex, setTabIndex] = React.useState(_tabIndex)
  const [toggleTabs] = React.useState([
    {
      value: 'record',
      label: t('稽核記錄'),
      view: AuditRecords,
      props: {
      }
    },
    {
      value: 'list',
      label: t('稽核表管理'),
      view: AuditList,
      props: {
      }
    },
    {
      value: 'collect',
      label: t('常用收藏'),
      view: AuditCollectList,
      props: {
      }
    },
    {
      value: 'AuditTemplate',
      label: t('稽核表公版'),
      view: AuditTemplateSystemClasses,
      props: {
      }
    }
  ])

  const rightIconOnPress = async () => {
    await AsyncStorage.removeItem('AuditCreate')
    navigation.navigate('AuditPickTemplate')
  }

  return (
    <>
      <WsPage002
        // title={'稽核管理'}
        rightOnPress={() => rightIconOnPress()}
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      >
      </WsPage002>
    </>
  )
}

export default AuditIndex
