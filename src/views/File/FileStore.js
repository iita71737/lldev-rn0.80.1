import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  LlBtn002,
  LlEventCard001,
  WsPage,
  LlEventHeaderNumCard,
  WsGrid,
  WsPageIndex,
  WsText,
  WsDes,
  WsCard,
  WsTabView
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import FileStoreTab1 from '@/views/File/FileStoreTab1'
import FileStoreTab2 from '@/views/File/FileStoreTab2'
import FileStoreTab3 from '@/views/File/FileStoreTab3'
import FileStoreTab4 from '@/views/File/FileStoreTab4'

const FileStore = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // Tabs
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'index_with_file',
      label: i18next.t('本單位'),
      view: FileStoreTab1,
      props: {
      },
    },
    {
      value: 'index_to_share',
      label: i18next.t('分享至其他單位'),
      view: FileStoreTab2,
      props: {
      },
    },
    {
      value: 'index_from_share',
      label: i18next.t('其他單位的分享'),
      view: FileStoreTab3,
      props: {
      },
    },
    {
      value: 'index_system',
      label: i18next.t('系統資料夾'),
      view: FileStoreTab4,
      props: {
      },
    }
  ])


  return (
    <WsTabView
      index={tabIndex}
      scrollEnabled={true}
      setIndex={settabIndex}
      items={tabItems}
    />
  )
}

export default FileStore