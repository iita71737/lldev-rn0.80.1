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
  WsPageIndex,
  LlGuidelineCard001
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'

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

const GuidelineCollection: React.FC<ActCollectionProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    navigation,
    currentTabIndex
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const collectGuidelineIds = useSelector(state => state.data.collectGuidelineIds)

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
    button: {
      type: 'date_range',
      label: t('修正發布日'),
      time_field: 'announce_at'
    },
    guideline_status: {
      label: t('施行狀態'),
      type: 'belongstomany',
      modelName: 'guideline_status',
      nameKey: 'name',
      serviceIndexKey: 'index',
      hasMeta: false,
      translate: false,
      params: {
        order_by: 'sequence',
        order_way: 'asc',
        get_all: '1'
      }
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

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <WsPageIndex
        modelName={'guideline'}
        serviceIndexKey={'authCollectIndex'}
        params={_params}
        filterFields={filterFields}
        renderItem={({ item, index: itemIndex, isLastItem }) => {
          return (
            <>
              <LlGuidelineCard001
                key={item.id}
                item={item}
                tags={item.factory_tags}
                title={item.last_version ? item.last_version.name : null}
                is_collect_visible={true}
                announce_at_visible={true}
                effect_at_visible={false}

                is_collect={collectGuidelineIds ? collectGuidelineIds.find((_id: number) => _id == item.id) : null}
                setSnackBarText={setSnackBarText}
                setIsSnackBarVisible={setIsSnackBarVisible}
                act_status={item.guideline_status}
                isChange={
                  item && item.updated_at ?
                    S_Act.getActUpdateDateBadge(item.updated_at) : null
                }
                onPress={() => {
                  navigation.push('RoutesAct', {
                    screen: 'GuidelineShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
                style={{
                  marginTop: 8,
                  marginHorizontal: 16
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

export default GuidelineCollection
