import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, FlatList } from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsFilter,
  LlBtn002,
  LlCheckListCard001,
  WsSkeleton,
  WsPageIndex
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

interface CheckListFrequencyProps {
  frequency: string | undefined;
  search: any;
  defaultFilter: any;
  type: string | undefined;
}

const CheckListFrequency: React.FC<CheckListFrequencyProps> = (props) => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  // Props
  const {
    frequency,
    search,
    defaultFilter,
    type,
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUser = useSelector(state => state.data.currentUser)

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      frequency: frequency ? frequency : undefined,
      order_by: 'created_at',
      order_way: 'desc',
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    }
    return _params
  }, [frequency, search, type, defaultFilter, currentRefreshCounter]);

  const [filterFields] = React.useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      cancelAllVisible: false,
      defaultSelected: false
    },
  })

  return (
    <>
      <WsPageIndex
        modelName={'checklist'}
        serviceIndexKey={type ? 'collectIndex' : 'index'}
        params={__params}
        extendParams={search}
        filterFields={filterFields}
        defaultFilterValue={defaultFilter}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlCheckListCard001
                testID={`LlCheckListCard001-${index}`}
                key={item.id}
                item={item}
                bookmarkBtnVisible={true}
                style={[
                  index == 0
                    ? {
                      marginTop: 16
                    }
                    : {
                      marginTop: 8
                    }
                ]}
                name={item.name}
                id={item.id}
                is_collect={item.is_collect}
                tagIcon={item.tagIcon}
                tagText={item.tagText}
                taker={
                  item.owner
                    ? item.owner
                    : item.taker
                      ? item.taker
                      : i18next.t('無')
                }
                system_subclasses={item.system_subclasses}
                factory_tags={item.factory_tags}
                onPress={() => {
                  navigation.push('CheckListShow', {
                    id: item.id
                  })
                }}
              />
            </>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default CheckListFrequency
