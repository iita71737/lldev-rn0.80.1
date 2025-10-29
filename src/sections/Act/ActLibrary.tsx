import React from 'react'
import { NavigationScreenProp, NavigationRoute } from 'react-navigation'
import {
  LlActLibrarySystemClassCard001,
  LlSystemClassesList,
  WsPageIndex
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setIdleCounter
} from '@/store/data'
import { debounce } from 'lodash';

interface ActLibraryProps {
  navigation: NavigationScreenProp<NavigationRoute>;
  searchValue?: string;
  defaultFilter?: any;
  _alliance?: any;
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

const ActLibrary: React.FC<ActLibraryProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    _alliance
  } = props

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentAreas = useSelector(state => state.data.currentAreas)
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
      storeKey: 'subAreas'
    },
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes'
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: 'actStatus'
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

  // DETECT IDLE
  const handleScroll = debounce((event) => {
    event.persist();
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  }, 1000);

  return (
    <>
      <WsPageIndex
        onScroll={handleScroll}
        mode={'system_classes'}
        filterFields={filterFields}
        renderItem={({ item, index, __params }) => {
          return (
            <LlActLibrarySystemClassCard001
              testID={`LlActLibrarySystemClassCard001-${index}`}
              key={index}
              item={item}
              params={__params}
            >
            </LlActLibrarySystemClassCard001>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default ActLibrary
