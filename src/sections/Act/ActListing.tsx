import React from 'react'
import {
  LlActCard001,
  WsSnackBar,
  WsPageIndex,
  WsIconBtn
} from '@/components'
import S_Act from '@/services/api/v1/act'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'

interface ActListingProps {
  navigation: any;
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

const ActListing: React.FC<ActListingProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    navigation,
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
  const currentAreas = useSelector(state => state.data.currentAreas)
  const currentSelectedArea = useSelector(state => state.data.currentSelectedArea)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const subAreas = useSelector(state => state.data.subAreas)
  const actStatus = useSelector(state => state.data.actStatus)
  const actTypes = useSelector(state => state.data.actTypes)

  // STATES
  const params = React.useMemo(() => ({
    order_by: 'announce_at',
    order_way: 'desc',
    time_field: 'announce_at',
    areas: currentSelectedArea ? currentSelectedArea : allianceAreaId
  }), [allianceAreaId]);

  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

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
      cancelAllVisible: false,
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: 'actStatus',
      selectAllVisible: false,
      cancelAllVisible: false,
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
    return allianceAreaId ? {
      areas: currentSelectedArea ? currentSelectedArea : allianceAreaId
    } : {};
  }, [allianceAreaId]);

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
        modelName={'act'}
        serviceIndexKey={'index'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={defaultFilterValue}
        // filterMode={'FAB'}
        // FABItems={[
        //   { label: '重新整理', onPress: () => { } },
        //   { label: '匯出', onPress: () => { } },
        // ]}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlActCard001
                testID={`LlActCard001-${index}`}
                tags={item.factory_tags}
                item={item}
                key={item.id}
                is_collect_visible={true}
                is_collect={currentUser ? currentUser.act_ids.find((_id: number) => _id == item.id) : null}
                setSnackBarText={setSnackBarText}
                setIsSnackBarVisible={setIsSnackBarVisible}
                systemSubClasses={item.system_subclasses}
                title={item.last_version ? item.last_version.name : null}
                announce_at_visible={true}
                effect_at_visible={false}
                act_status={item.act_status}
                isChange={
                  item.last_version && item.last_version.announce_at ?
                    S_Act.getActUpdateDateBadge(item.last_version.announce_at) : null
                }
                onPress={() => {
                  navigation.push('RoutesAct', {
                    screen: 'ActShow',
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

export default ActListing
