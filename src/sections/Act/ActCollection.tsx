import React, { useState } from 'react'
import { View } from 'react-native'
import {
  WsFilter,
  LlBtn002,
  LlActCard001,
  WsInfiniteScroll,
  WsFilterFixedBtn,
  WsText,
  WsEmpty,
  WsIconBtn,
  WsSkeleton,
  WsSnackBar,
  WsPageIndex
} from '@/components'
import S_MyAct from '@/services/api/v1/my_act'
import moment from 'moment'
import S_Processor from '@/services/app/processor'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import { setPlatformAPI } from 'echarts/core'

interface ActCollectionProps {
  navigation: any;
  searchValue?: string;
  defaultFilter?: any;
  currentTabIndex?: number;
}

interface ParamsState {
  order_by: string;
  order_way: string;
  time_field: string;
  refreshCounter?: number;
}

const ActCollection: React.FC<ActCollectionProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    navigation,
    currentTabIndex
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // States
  const [refreshCounter, setRefreshCounter] = React.useState(1);
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      order_by: 'announce_at',
      order_way: 'desc',
      time_field: 'announce_at',
    }
    return params
  }, [refreshCounter, currentRefreshCounter]);

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
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <WsPageIndex
        modelName={'my_act'}
        serviceIndexKey={'index'}
        params={_params}
        filterFields={filterFields}
        renderItem={({ item, index: itemIndex, isLastItem }) => {
          return (
            <>
              <LlActCard001
                testID={`LlActCard001-${itemIndex}`}
                key={itemIndex}
                item={item}
                is_collect={true}
                setSnackBarText={setSnackBarText}
                setIsSnackBarVisible={setIsSnackBarVisible}
                currentTabIndex={currentTabIndex}
                refreshCounter={refreshCounter}
                setRefreshCounter={setRefreshCounter}
                systemSubClasses={item.system_subclasses}
                title={item.last_version ? item.last_version.name : null}
                is_collect_visible={true}
                announce_at_visible={true}
                effect_at_visible={false}
                act_status={item.act_status}
                isChange={item.last_version && item.last_version.effect_at ? S_Act.getActUpdateDateBadge(
                  item.last_version.effect_at
                ) : null}
                onPress={() => {
                  navigation.push('RoutesAct', {
                    screen: 'ActShow',
                    params: {
                      id: item.id,
                    }
                  })
                }}
                style={{
                  marginTop: 8
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

export default ActCollection
