import React, { useState } from 'react'
import { View, FlatList } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  WsFilter,
  LlBtn002,
  LlActCard001,
  WsText,
  WsSkeleton,
  LlActLibrarySystemClassCard002,
  WsEmpty,
  WsIconBtn,
  WsFilter002,
  WsPageIndex,
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

interface ActChangeReportProps {
  searchValue?: string;
  defaultFilter?: any;
}

const ActChangeReport: React.FC<ActChangeReportProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    searchValue,
  } = props

  // States
  const [filterFields] = React.useState({
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes'
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: "actStatus"
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'effect_at'
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  const [params] = React.useState({
    order_by: 'effect_at',
    order_way: 'desc',
    time_field: 'effect_at',
    start_time: undefined,
    end_time: undefined,
    page: 1
  })

  return (
    <>
      <WsPageIndex
        mode={'system_classes'}
        params={params}
        extendParams={searchValue}
        filterFields={filterFields}
        renderItem={({ item, index, __params }) => {
          return (
            <LlActLibrarySystemClassCard002
              testID={`LlActLibrarySystemClassCard002-${index}`}
              item={item}
              index={index}
              params={__params}
            >
            </LlActLibrarySystemClassCard002>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default ActChangeReport
