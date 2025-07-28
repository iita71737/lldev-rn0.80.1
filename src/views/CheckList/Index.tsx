import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  LlToggleTabBar001,
  WsIconBtn,
  WsDialog,
  WsPage,
  WsPage002
} from '@/components'
import CheckListManage from '@/sections/CheckList/CheckListManage'
import ChecklistRecordAnalytics from '@/sections/CheckList/ChecklistRecordAnalytics'
import { useTranslation } from 'react-i18next'
import CheckListTemplateList from '@/views/CheckList/Template/CheckListTemplateList'

interface CheckListIndexProps {
  navigation: any;
  route: any;
}

const CheckListIndex: React.FC<CheckListIndexProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { } = route

  const _tabIndex = route?.params?.tabIndex

  // State
  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [toggleTabs] = useState([
    {
      value: 'record',
      label: t('點檢記錄'),
      view: ChecklistRecordAnalytics,
      props: {
      }
    },
    {
      value: 'list',
      label: t('點檢表管理'),
      view: CheckListManage,
      props: {
      },
    },
    {
      value: 'collection',
      label: t('常用收藏'),
      view: CheckListManage,
      props: {
        type: 'collection'
      }
    },
    {
      value: 'checklistTemplate',
      label: t('點檢表公版'),
      view: CheckListTemplateList,
      props: {
      }
    }
  ])

  const rightIconOnPress = async () => {
    navigation.navigate('CheckListPickTemplate')
  }

  return (
    <>
      <WsPage002
        // title={'點檢表管理'}
        // rightOnPress={() => rightIconOnPress()}
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      >
      </WsPage002>
    </>
  )
}

export default CheckListIndex
