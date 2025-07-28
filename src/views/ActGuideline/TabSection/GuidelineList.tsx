import React from 'react'
import {
  LlActCard001,
  WsSnackBar,
  WsPageIndex,
  LlGuidelineCard001
} from '@/components'
import store from '@/store'
import {
  setCollectGuidelineIds,
} from '@/store/data'
import S_Act from '@/services/api/v1/act'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import guideline from '@/services/api/v1/guideline'
import guideline_status from '@/services/api/v1/guideline_status'
import S_Guideline from '@/services/api/v1/guideline'

interface ActListingProps {
  navigation: any;
  searchValue?: string;
  defaultFilter?: any;
}

const GuidelineList: React.FC<ActListingProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    navigation,
  } = props

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const collectGuidelineIds = useSelector(state => state.data.collectGuidelineIds)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      lang: 'tw',
      order_by: 'announce_at',
      order_way: 'desc'
    }
    return params
  }, [currentRefreshCounter]);

  // States
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
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

  // INIT setCollectGuidelineIds
  const $_fetchGuidelineAuthCollectIndex = async () => {
    try {
      const res = await S_Guideline.authCollectIndex({})
      if (res) {
        const _ids = res.data.map(_ => _.id)
        store.dispatch(setCollectGuidelineIds(_ids))
      }
    } catch (error) {
      console.log(error, '$_fetchGuidelineAuthCollectIndex')
    }
  }

  React.useEffect(() => {
    $_fetchGuidelineAuthCollectIndex()
  }, [])

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
        serviceIndexKey={'index'}
        params={_params}
        filterFields={filterFields}
        renderItem={({ item, index, isLastItem }) => {
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

export default GuidelineList
