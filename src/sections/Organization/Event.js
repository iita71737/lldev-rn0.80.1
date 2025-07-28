import React, { useState } from 'react'
import { View, Text, ScrollView, Image } from 'react-native'
import { WsCard, WsText } from '@/components'
import { useTranslation } from 'react-i18next'

const OrganizationEvent = props => {
  const { t, i18n } = useTranslation()

  const dataFromApi = [
    {
      id: 1,
      title: '接獲高雄市環保局排放污水罰單：限期改善＋罰鍰30萬',
      chip: {
        text: t('處理中'),
        color: 'yellow'
      },
      categoryTag: ['水污染防治', '空氣污染防治'],
      date: '16:40'
    },
    {
      id: 1,
      title: 'A廠8號排放口排放氨氮值超標：9.0',
      chip: {
        text: t('列管中'),
        color: 'red'
      },
      categoryTag: ['水污染防治', '空氣污染防治'],
      date: '15:05'
    },
    {
      id: 1,
      title: 'A廠8號排放口排放氨氮值超標：9.0',
      chip: {
        text: t('已核銷'),
        color: 'lightGray'
      },
      categoryTag: ['水污染防治', '空氣污染防治'],
      date: '15:05'
    }
  ]

  const { events } = props

  return (
    <>
      <ScrollView>
      </ScrollView>
    </>
  )
}

export default OrganizationEvent
