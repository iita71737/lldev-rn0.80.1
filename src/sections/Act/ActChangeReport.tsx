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
import { useSelector } from 'react-redux'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'

interface ActChangeReportProps {
  searchValue?: string;
  defaultFilter?: any;
  _alliance?: string
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


const ActChangeReport: React.FC<ActChangeReportProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    _alliance
  } = props

  // 1) 把當前的 allianceAreaId 算出來（物件或純 id 都支援）
  const allianceAreaId = React.useMemo(
    () =>
      (typeof _alliance?.area === 'object'
        ? _alliance?.area?.id
        : _alliance?.area) ?? undefined,
    [_alliance?.area]
  );

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const systemClasses = useSelector(state => state.data.systemClasses)
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

  // Fields
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

   // 2) defaultFilterValue 跟著 allianceAreaId 改變
   const defaultFilterValue = React.useMemo(() => {
     return {
       areas: currentSelectedArea ? currentSelectedArea : allianceAreaId ? allianceAreaId : currentFactory?.area?.id ? currentFactory?.area?.id : undefined,
       range: "nolimit",
       system_subclasses: S_SystemClass.getAllSubSystemClassesId(systemClasses),
     }
   }, [currentSelectedArea, allianceAreaId]);

  return (
    <>
      <WsPageIndex
        mode={'system_classes'}
        filterFields={filterFields}
        defaultFilterValue={defaultFilterValue}
        renderItem={({ item, index, __params }) => {
          return (
            <LlActLibrarySystemClassCard002
              testID={`LlActLibrarySystemClassCard002-${index}`}
              item={item}
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
