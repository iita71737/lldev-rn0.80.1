import React, { useState, useEffect, useCallback } from 'react'
import { View } from 'react-native'
import {
  WsPaddingContainer,
  WsState,
  LlTaskCard001,
  WsPageIndex
} from '@/components'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native'
import { useSelector } from 'react-redux'

interface TaskStatusProps {
  status: string;
  navigation: any;
  searchValue: string;
  defaultFilter: any;
}
interface TaskItem {
  sub_tasks: any[];
  done_at: string | null;
  id: string;
}

const TaskStatus: React.FC<TaskStatusProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const isFocused = useIsFocused();

  // Props
  const {
    status,
    filterFields,
    filterValue,
    params,
    onParamsChange
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // States
  const [sortValue, setSortValue] = React.useState<number>(1)

  // MEMO
  const __params = React.useMemo(() => {
    if (isFocused) {
      const _params =
        sortValue == 1 ?
          {
            ...params,
            order_way: "desc",
            order_by: "created_at"
          } : sortValue == 2 ? {
            ...params,
            order_way: 'asc',
            order_by: 'expired_at',
          } : sortValue == 3 ? {
            ...params,
            order_way: 'asc',
            order_by: 'completion_degree',
          } : {}
      return _params
    }
  }, [sortValue, status, currentRefreshCounter]);

  return (
    <>
      <WsPageIndex
        modelName={'task'}
        params={__params}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index }) => (
          <>
            <View
              style={{
                marginBottom: 8
              }}>
              <LlTaskCard001
                testID={`LlTaskCard001-${index}`}
                item={item}
                onPress={() => {
                  navigation.push('RoutesTask', {
                    screen: 'TaskShow',
                    params: {
                      id: item.id,
                      taskStatus: status
                    }
                  })
                }}
              />
            </View>
          </>
        )}
        emptyTitle={t('目前尚無資料')}
        ListHeaderComponent={() => {
          return (
            <WsPaddingContainer>
              <View
                style={{
                  flexDirection: 'row'
                }}>
                <WsState
                  borderRadius={25}
                  borderWidth={0.5}
                  style={{
                    flex: 1,
                    borderColor: $color.gray
                  }}
                  type="picker"
                  value={sortValue}
                  onChange={setSortValue}
                  items={[
                    {
                      label: i18next.t('依建立日期由近至遠'),
                      value: 1
                    },
                    {
                      label: i18next.t('依期限由舊至新'),
                      value: 2
                    },
                    {
                      label: i18next.t('依完成度由低至高'),
                      value: 3
                    }
                  ]}
                />
              </View>
            </WsPaddingContainer>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default TaskStatus
