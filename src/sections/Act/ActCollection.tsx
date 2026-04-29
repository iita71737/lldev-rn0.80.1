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
  _alliance?: any;
}

interface ParamsState {
  order_by: string;
  order_way: string;
  time_field: string;
  refreshCounter?: number;
}

type AreaLike =
  | string
  | number
  | {
    label?: string;
    name?: string;
    title?: string;
    value?: string | number;
    code?: string | number;
    id?: string | number;
    list?: AreaLike[];
  };

const ActCollection: React.FC<ActCollectionProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    navigation,
    currentTabIndex,
    _alliance,
    searchValue
  } = props

  const allianceAreaId = _alliance?.area?.id ?? undefined;

  // Redux
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentAreas = useSelector(state => state.data.currentAreas)
  const currentSelectedArea = useSelector(state => state.data.currentSelectedArea)
  const subAreas = useSelector(state => state.data.subAreas)
  const actStatus = useSelector(state => state.data.actStatus)
  const actTypes = useSelector(state => state.data.actTypes)

  // 把 currentAreas 轉成 picker 需要的 {label, value}[]
  const areaItems = React.useMemo<{ label: string; value: string | number }[]>(() => {
    const rawList: AreaLike[] =
      Array.isArray(currentAreas) ? currentAreas
        : Array.isArray(currentAreas?.list) ? currentAreas.list
          : currentAreas ? [currentAreas]
            : []
    return rawList
      .map((a: AreaLike) => {
        if (typeof a === 'string' || typeof a === 'number') {
          return { label: String(a), value: a }
        }
        const label = a.label ?? a.name ?? a.title ?? ''
        const value = a.value ?? a.code ?? a.id ?? ''
        return label && (value !== '') ? { label: String(label), value } : null
      })
      .filter((x): x is { label: string; value: string | number } => !!x)
  }, [currentAreas])

  // States
  const [refreshCounter, setRefreshCounter] = React.useState(1);
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // MEMO
  const filterFields = React.useMemo(() => ({
    areas: {
      type: 'picker',
      label: t('地區'),
      placeholder: t('選擇'),
      items: areaItems,
    },
    area_sections: {
      type: 'checkbox',
      label: t('子地區'),
      storeKey: 'subAreas',
      selectAllVisible: false,
      cancelAllVisible: false
    },
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes',
      selectAllVisible: false,
      cancelAllVisible: false
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: 'actStatus',
      selectAllVisible: false,
      cancelAllVisible: false
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
      storeKey: 'factoryTags',
      searchVisible: true,
      selectAllVisible: false,
      cancelAllVisible: false,
      defaultSelected: false
    },
  }), [areaItems, subAreas, actStatus, actTypes])

  const _params = React.useMemo(() => {
    const params = {
      order_by: 'announce_at',
      order_way: 'desc',
      time_field: 'announce_at',
      search: searchValue ? searchValue : undefined
    }
    return params
  }, [refreshCounter, currentRefreshCounter, searchValue]);

  // defaultFilterValue
  const [defaultFilterValue] = React.useState(() => {
    const allianceAreaId =
      (typeof _alliance?.area === 'object' ? _alliance?.area?.id : _alliance?.area) ?? null;
    const firstAreaId = Array.isArray(currentAreas) ? currentAreas[0]?.id : undefined;
    const id = currentSelectedArea ? currentSelectedArea : allianceAreaId ?? firstAreaId;
    return id ? { areas: id } : {};
  });

  // 用 key 讓 WsPageIndex 在 area 變時重掛載
  const pageKey = React.useMemo(
    () => `act-${allianceAreaId ?? 'none'}`,
    [allianceAreaId]
  );

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <WsPageIndex
        key={pageKey}
        modelName={'my_act'}
        serviceIndexKey={'index'}
        params={_params}
        filterFields={filterFields}
        defaultFilterValue={defaultFilterValue}
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

export default ActCollection
