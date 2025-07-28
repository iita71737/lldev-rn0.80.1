import React from 'react'

import { WsTabView } from '@/components'
import i18next from 'i18next'
import ChecklistConclusionDaily from '@/sections/CheckList/ChecklistConclusionDaily'
import CheckListRecords from '@/sections/CheckList/CheckListRecords'
import { useFocusEffect } from '@react-navigation/native'

interface ChecklistRecordAnalyticsProps {
}

const ChecklistRecordAnalytics: React.FC<ChecklistRecordAnalyticsProps> = props => {

  const {
  } = props

  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState<Array<{
    value: string;
    label: string;
    view: React.ComponentType<any>;
    props?: any;
  }>>()

  const $_setToggleTabs = () => {
    setTabItems([
      {
        value: 'ChecklistConclusionDaily',
        label: i18next.t('今日點檢結論'),
        view: ChecklistConclusionDaily
      },
      {
        value: 'CheckListRecords',
        label: i18next.t('日'),
        view: CheckListRecords,
        props: {
          frequency: 'day',
        }
      },
      {
        value: 'CheckListWeek',
        label: i18next.t('週'),
        view: CheckListRecords,
        props: {
          frequency: 'week',
        }
      },
      {
        value: 'CheckListMonth',
        label: i18next.t('月'),
        view: CheckListRecords,
        props: {
          frequency: 'month',
        }
      },
      {
        value: 'CheckListYearly',
        label: i18next.t('年'),
        view: CheckListRecords,
        props: {
          frequency: 'year',
        }
      },
    ])
  }

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      $_setToggleTabs()
      return () => {
        // Do something when the screen is unfocused
      }
    }, [])
  )

  return (
    <>
      {tabItems && (
        <WsTabView
          items={tabItems}
          scrollEnabled={true}
          index={tabIndex}
          setIndex={settabIndex}
          isAutoWidth={true}
        />
      )}
    </>
  )
}

export default ChecklistRecordAnalytics
