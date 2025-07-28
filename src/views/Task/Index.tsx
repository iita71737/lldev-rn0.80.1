import React, { useEffect } from 'react'
import { WsIconBtn, WsTabView, WsPage, WsText } from '@/components'
import TaskStatus from '@/sections/Task/TaskStatus'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_Task from '@/services/api/v1/task'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useFocusEffect } from '@react-navigation/native';
import i18next from 'i18next'

const TaskIndex = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  const _tabIndex = route.params?._tabIndex

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // States
  const [loading, setLoading] = React.useState<boolean>(true);
  const [advanceCount, setAdvanceCount] = React.useState()
  const [pendingCount, setPendingCount] = React.useState()
  const [completeCount, setCompleteCount] = React.useState()
  const [allCount, setAllCount] = React.useState()

  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [tabItems, setTabItems] = React.useState<undefined>();

  const [filterValue, setFilterValue] = React.useState<any>();
  const [filterFields] = React.useState<any>({
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    button: {
      type: 'date_range',
      label: t('建立日期'),
      time_field: 'created_at'
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
  const [tabParams, setTabParams] = React.useState<any>({
    order_way: "desc",
    order_by: "created_at",
    time_field: 'created_at'
  })

  // Function
  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'advance',
        label: t('進行中'),
        view: TaskStatus,
        props: {
          status: 'advance',
          params: {
            ...tabParams,
            done_at: 'null',
            checked_at: 'null'
          },
          filterFields: filterFields,
          filterValue: filterValue,
          onParamsChange: $_onParamsChange
        },
        tabNum: advanceCount ? advanceCount : '0'
      },
      {
        value: 'pending',
        label: t('待審核'),
        view: TaskStatus,
        props: {
          status: 'pending',
          params: {
            ...tabParams,
            done_at: 'not_null',
            checked_at: 'null'
          },
          filterFields: filterFields,
          filterValue: filterValue,
          onParamsChange: $_onParamsChange
        },
        tabNum: pendingCount ? pendingCount : '0'
      },
      {
        value: 'complete',
        label: t('已完成'),
        view: TaskStatus,
        props: {
          status: 'complete',
          params: {
            ...tabParams,
            done_at: 'not_null',
            checked_at: 'not_null'
          },
          filterFields: filterFields,
          filterValue: filterValue,
          onParamsChange: $_onParamsChange
        },
        tabNum: completeCount ? completeCount : '0'
      },
      {
        value: 'all',
        label: t('全部'),
        view: TaskStatus,
        props: {
          status: 'all',
          params: {
            ...tabParams,
            checked_at: undefined,
            done_at: undefined,
          },
          filterFields: filterFields,
          filterValue: filterValue,
          onParamsChange: $_onParamsChange
        },
        tabNum: allCount ? allCount : '0'
      }
    ])
  }

  const $_setTabNum = async (_params: any = {}) => {
    delete _params.done_at
    delete _params.checked_at
    try {
      const res = await S_Task.tabIndex({
        params: _params
      })
      await Promise.all([res])
        .then(res => {
          setAdvanceCount(res[0].data.in_progress_count.toString())
          setPendingCount(res[0].data.audited_count.toString())
          setCompleteCount(res[0].data.complete_count.toString())
          setAllCount(res[0].data.total_count.toString())
          setLoading(false)
        })
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }

  const $_onParamsChange = (params: any, filtersValue: any) => {
    let _allParams = {
      ...tabParams,
      ...params,
    }
    if (filterValue && !filtersValue.search) {
      delete _allParams.search
    }
    setTabParams(_allParams)
    setFilterValue(filtersValue)
    $_setTabNum(_allParams)
  }

  // Storage
  const $_clearStorage = async () => {
    await AsyncStorage.removeItem('TaskCreate')
  }

  useEffect(() => {
    $_setTabNum(tabParams)
  }, [tabItems, filterValue, currentFactory])

  useEffect(() => {
    $_setTabItems()
  }, [advanceCount, pendingCount, completeCount, allCount, filterValue, currentRefreshCounter])

  return (
    <>
      <WsPage
        title={t('任務')}
        showRightBtn={true}
        iconRight="md-add"
        rightOnPress={() => {
          $_clearStorage()
          navigation.push('RoutesTask', {
            screen: 'TaskCreate'
          })
        }}
      >
        {tabItems && !loading && (
          <>
            <WsTabView
              isAutoWidth={true}
              items={tabItems}
              index={tabIndex}
              setIndex={setTabIndex}
            />
          </>
        )}
      </WsPage>
    </>
  )
}

export default TaskIndex
