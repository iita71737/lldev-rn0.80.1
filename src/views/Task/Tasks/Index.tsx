import React, { useEffect } from 'react'
import { WsTabView } from '@/components'
import TaskStatus from '@/sections/Task/TaskStatus'
import { useTranslation } from 'react-i18next'
import S_Task from '@/services/api/v1/task'
import { useSelector } from 'react-redux'
import WsSkeleton from '__reactnative_stone/components/WsSkeleton'

const TaskIndex = ({ route }) => {
  const { t } = useTranslation()
  const _tabIndex = route?.params?._tabIndex

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // States
  const [loading, setLoading] = React.useState<boolean>(true);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [tabNums, setTabNums] = React.useState({
    advance: '0',
    pending: '0',
    complete: '0',
    all: '0'
  })

  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)

  const [filterValue, setFilterValue] = React.useState<any>({
    order: {
      order_by: 'created_at',
      order_way: 'desc'
    }
  });
  const [filterFields] = React.useState<any>({
    order: {
      type: 'picker',
      label: t('排序'),
      placeholder: t('選擇排序'),
      items: [
        {
          label: t('依建立日期由近至遠'),
          value: {
            order_by: 'created_at',
            order_way: 'desc'
          }
        },
        {
          label: t('依期限由舊至新'),
          value: {
            order_by: 'expired_at',
            order_way: 'asc'
          }
        },
        {
          label: t('依完成度由低至高'),
          value: {
            order_by: 'completion_degree',
            order_way: 'asc'
          }
        }
      ]
    },
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

  const tabNumDebounceRef = React.useRef<any>(null)
  const isFirstParamsChangeRef = React.useRef<boolean>(true)

  const tabItems = React.useMemo(() => {
    return [
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
        tabNum: tabNums.advance
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
        tabNum: tabNums.pending
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
        tabNum: tabNums.complete
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
        tabNum: tabNums.all
      }
    ]
  }, [t, tabParams, filterFields, filterValue, tabNums])

  const $_setTabNum = async (_params: any = {}) => {
    const _requestParams = {
      ..._params
    }
    delete _requestParams.done_at
    delete _requestParams.checked_at
    try {
      const res = await S_Task.tabIndex({
        params: _requestParams
      })
      await Promise.all([res])
        .then(res => {
          setTabNums({
            advance: res[0].data.in_progress_count?.toString() || '0',
            pending: res[0].data.audited_count?.toString() || '0',
            complete: res[0].data.complete_count?.toString() || '0',
            all: res[0].data.total_count?.toString() || '0'
          })
          setLoading(false)
          setInitialized(true)
        })
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }

  function $_onParamsChange(params: any, filtersValue: any) {
    if (isFirstParamsChangeRef.current) {
      isFirstParamsChangeRef.current = false
      return
    }
    const _allParams: any = {
      ...params,
    }
    delete _allParams.done_at
    delete _allParams.checked_at
    if (!_allParams.order_by || !_allParams.order_way) {
      _allParams.order_by = 'created_at'
      _allParams.order_way = 'desc'
    }
    if (!filtersValue?.search) {
      delete _allParams.search
    }
    const filtersChanged = JSON.stringify(filtersValue) !== JSON.stringify(filterValue)

    if (filtersChanged) {
      setFilterValue(filtersValue)
    }

    if (tabNumDebounceRef.current) {
      clearTimeout(tabNumDebounceRef.current)
    }
    tabNumDebounceRef.current = setTimeout(() => {
      const _prevParamsText = JSON.stringify(tabParams || {})
      const _nextParamsText = JSON.stringify(_allParams || {})
      if (_prevParamsText !== _nextParamsText) {
        setTabParams(_allParams)
      }
    }, 200)
  }

  useEffect(() => {
    if (!initialized) {
      setLoading(true)
    }
    $_setTabNum(tabParams)
  }, [tabParams, currentFactory, currentRefreshCounter])

  useEffect(() => {
    return () => {
      if (tabNumDebounceRef.current) {
        clearTimeout(tabNumDebounceRef.current)
      }
    }
  }, [])

  return (
    <>
      {tabItems && !loading ? (
        <>
          <WsTabView
            key={`task-tabnums-${tabNums.advance}-${tabNums.pending}-${tabNums.complete}-${tabNums.all}`}
            isAutoWidth={true}
            items={tabItems}
            index={tabIndex}
            setIndex={setTabIndex}
          />
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

export default TaskIndex
