import React, { useState, useEffect, useCallback } from 'react'
import { FlatList } from 'react-native'
import { WsEmpty, WsSkeleton, WsLoading } from '@/components'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'

const WsInfiniteScroll = props => {
  const navigation = useNavigation()

  // Prop
  const {
    mode = 'page',
    fillDateEmpty = false,
    isSorted = false,
    getEmptyItem,
    timeField = 'created_at',
    startDate,
    endDate,
    limitKey,
    limit = 15,
    perDays = 15,
    parentId,
    params,
    pageKey = 'page',
    lastPageKey = 'last_page',
    currentPageKey = 'current_page',
    serviceFormatKey,
    service,
    hasMeta = true,
    getAll = false,
    getResData,
    getFormattedModels,
    token,
    renderItem,
    ListHeaderComponent,
    padding = 0,
    serviceIndexKey = 'index',
    isRefreshing = false,
    onRefreshed,
    emptyTitle,
    emptyText,
    style,
    onRefreshEnable = true,
    onEndReachedThreshold = .8
  } = props

  // State
  const [models, setModels] = useState([])
  const [fModels, setFModels] = useState([])

  const [currentPage, setCurrentPage] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [isFetching, setIsFetching] = useState(false)
  const [isRefreshing_C, setIsRefreshing_C] = useState(false)
  const [isFinalRound, setIsFinalRound] = useState(false)
  const [clear, setClear] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentDate, setCurrentDate] = useState(
    moment(startDate).format('YYYY-MM-DD')
  )
  const [modeDateCounter, setModeDateCounter] = useState(0)

  // Function
  const $_fetchModels = async () => {
    // 開始計時
    const startTime = performance.now();

    const token = await S_Keychain.getToken()
    if (!token) {
      return
    }
    if (hasMeta && lastPage <= currentPage && mode == 'page') {
      return
    } else if (mode == 'date' && currentDate == endDate) {
      return
    } else if (isFinalRound) {
      return
    }
    setIsFetching(true)
    const _params = {
      ...params
    }
    if (mode == 'page') {
      _params[pageKey] = currentPage + 1
      if (limitKey) {
        _params[limitKey] = limit
      }
    } else if (mode == 'date') {
      _params.start_time = currentDate
      _params.end_time = moment(currentDate)
        .add(perDays, 'days')
        .format('YYYY-MM-DD')
      if (moment(_params.end_time).isAfter(endDate)) {
        _params.end_time = endDate
      }
      _params.time_field = timeField
    }
    const res = await service[serviceIndexKey]({
      token: token,
      params: _params,
      parentId: parentId,
      page: currentPage + 1
    })
    let fetchedModels
    if (getResData) {
      fetchedModels = getResData(res)
    }
    else {
      fetchedModels = res.data
    }
    if (getAll) {
      setLastPage(currentPage)
    } else if (mode == 'page') {
      if (hasMeta) {
        setLastPage(res.meta[lastPageKey])
        setCurrentPage(parseInt(res.meta[currentPageKey]))
      } else {
        setCurrentPage(currentPage + 1)
        if (fetchedModels.length < limit) {
          setIsFinalRound(true)
        }
      }
    }
    const _models = []
    fetchedModels.forEach(_model => {
      const target = models.find(e => {
        return e.id == _model.id
      })
      if (!target) {
        _models.push(_model)
      }
    })
    setModels([...models, ..._models])

    if (mode == 'date') {
      setCurrentDate(_params.end_time)
      const currentCounter = modeDateCounter + fetchedModels.length
      if (currentCounter < limit) {
        setModeDateCounter(modeDateCounter + fetchedModels.length)
      } else {
        setModeDateCounter(0)
      }
    }
    setIsLoaded(true)
    setIsFetching(false)
    setIsRefreshing_C(false)

    // 結束計時
    const endTime = performance.now();
    // 計算執行時間（以毫秒為單位）
    const duration = endTime - startTime;
    // console.log('API 執行時間：', duration, '毫秒');

  }

  const $_updateFModels = async () => {
    let _models = []
    if (getFormattedModels) {
      const formatted = await getFormattedModels(models)
      _models = formatted
    } else if (serviceFormatKey) {
      const formatted = await service[serviceFormatKey](models)
      _models = formatted
    } else {
      _models = models
    }

    if (fillDateEmpty) {
      const _emptyItems = []
      const countDays = moment(endDate).diff(moment(startDate), 'days')
      for (let i = 0; i <= countDays; i++) {
        let dayHaveItem = false
        const checkDay = moment(startDate).add(i, 'days')
        _models.forEach(model => {
          if (
            moment(checkDay).format('YYYY-MM-DD') ==
            moment(model[timeField]).format('YYYY-MM-DD')
          ) {
            dayHaveItem = true
          }
        })
        if (!dayHaveItem) {
          _emptyItems.push(getEmptyItem(checkDay))
        }
      }
      _models = [..._emptyItems, ..._models]
    }
    if (isSorted) {
      _models = _models.sort((a, b) => {
        const _a = moment(a[timeField]).format('YYYY-MM-DD')
        const _b = moment(b[timeField]).format('YYYY-MM-DD')
        return moment(_a).isAfter(moment(_b))
      })
    }
    setFModels(_models)
    setIsRefreshing_C(false)
  }

  const $_onRefresh = () => {
    setIsRefreshing_C(true)
  }

  const $_clear = () => {
    setCurrentPage(0)
    setLastPage(1)
    setModels([])
    setClear(false)
  }

  const $_onEndReached = () => {
    if (isLoaded) {
      $_fetchModels()
    }
  }

  // Effect
  useEffect(() => {
    $_fetchModels()
  }, [])

  useEffect(() => {
    if (isRefreshing_C) {
      setClear(true)
    }
  }, [isRefreshing_C])

  useEffect(() => {
    setClear(true)
  }, [params])

  useEffect(() => {
    if (clear) {
      $_clear()
    } else {
      setTimeout(() => {
        $_fetchModels()
      }, 0);
    }
  }, [clear])

  useEffect(() => {
    $_updateFModels()
  }, [models])

  useEffect(() => {
    if (!isRefreshing) {
      return
    }
    setIsRefreshing_C(true)
    if (onRefreshed) {
      onRefreshed()
    }
    return () => { }
  }, [isRefreshing])

  useEffect(() => {
    if (isLoaded && modeDateCounter < limit) {
      $_fetchModels()
    }
  }, [currentDate])

  // Render
  return (
    <>
      {fModels && onRefreshEnable && (
        <FlatList
          windowSize={2}
          maxToRenderPerBatch={1}
          updateCellsBatchingPeriod={1000}
          initialNumToRender={3}

          keyExtractor={(item, index) => item.id + `${index}`}
          data={fModels}
          renderItem={({ item, index }) => {
            return renderItem({
              item,
              index,
              items: fModels
            })
          }}
          onRefresh={onRefreshEnable ? $_onRefresh : null}
          refreshing={isRefreshing_C}
          ListHeaderComponent={ListHeaderComponent}
          onEndReached={$_onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          progressViewOffset={0}
          style={[
            {
              padding: padding,
              // height: height //2023-07-04-checklist-create-user-picker-issues
            },
            style
          ]}
          ListFooterComponent={
            isFetching
              ? () => {
                return (
                  <>
                    {!isLoaded && <WsSkeleton type="cardlist" />}
                    {isFetching && isLoaded && <WsLoading type="a" />}
                  </>
                )
              }
              : null
          }
          ListEmptyComponent={() => {
            return (
              <>
                {(!isFetching && !mode == 'date') ||
                  (!isFetching && fModels.length === 0 && (
                    <WsEmpty emptyTitle={emptyTitle} emptyText={emptyText} />
                  ))}
              </>
            )
          }}
        />
      )}
    </>
  )
}

export default WsInfiniteScroll
