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
import PDFToolList from '@/views/PDFTool/PDFToolList'
import PDFToolTemplateList from '@/views/PDFTool/PDFToolTemplateList'

const PDFToolAdminIndex = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // Tabs
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'PDFToolList',
      label: i18next.t('議事列表'),
      view: PDFToolList,
      props: {
      },
    },
    {
      value: 'PDFToolTemplateList',
      label: i18next.t('範本'),
      view: PDFToolTemplateList,
      props: {
      },
    }
  ])


  return (
    <>
      <WsTabView
        index={tabIndex}
        setIndex={settabIndex}
        items={tabItems}
        isAutoWidth={true}
      />
    </>
  )
}

export default PDFToolAdminIndex