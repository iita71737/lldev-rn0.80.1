import React, { useState, useEffect } from 'react'
import { FlatList, SectionList } from 'react-native'
import { WsEmpty, WsSkeleton, WsLoading } from '@/components'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'

const WsInfiniteScrollSectionList = props => {
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
    getFormatedModels,
    token,
    renderItem,
    ListHeaderComponent,
    renderSectionHeader,
    padding = 0,
    serviceIndexKey = 'index',
    isRefreshing = false,
    onRefreshed,
    emptyTitle,
    emptyText,
    onItemsFetch = () => { }
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
    if (hasMeta && lastPage <= currentPage && mode == 'page') {
      return
    } else if (mode == 'date' && currentDate == endDate) {
      return
    } else if (isFinalRound) {
      return
    }
    if (isFetching) {
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

    onItemsFetch(res.data)
    let fetchedModels
    if (getResData) {
      fetchedModels = getResData(res)
    } else {
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
  }

  const $_updateFModels = async () => {
    let _models = []
    if (getFormatedModels) {
      const formated = await getFormatedModels(models)
      _models = formated
    } else if (serviceFormatKey) {
      const formated = await service[serviceFormatKey](models)
      _models = formated
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
  }
  const $_onRefresh = async () => {
    setIsRefreshing_C(true)
  }
  const $_clear = async () => {
    setCurrentPage(0)
    setLastPage(1)
    setModels([])
    setClear(false)
  }
  const $_onEndReached = () => {
    // $_fetchModels()
  }

  // Effect
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
      $_fetchModels()
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

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action and update data
      $_fetchModels()
    })
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

  // Render
  return (
    <>
      <SectionList
        sections={fModels}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => {
          return renderItem({
            item,
            index,
            section: fModels
          })
        }}
        renderSectionHeader={renderSectionHeader}
        // onRefresh={$_onRefresh}
        // refreshing={isRefreshing_C}
        ListHeaderComponent={ListHeaderComponent}
        // onEndReached={$_onEndReached}
        // onEndReachedThreshold={0.2}
        // progressViewOffset={0}
        style={[
          {
            padding: padding,
            height: 400
          }
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
              {!isFetching && !mode == 'date' && (
                <WsEmpty emptyTitle={emptyTitle} emptyText={emptyText} />
              )}
            </>
          )
        }}
      />
    </>
  )
}

export default WsInfiniteScrollSectionList
