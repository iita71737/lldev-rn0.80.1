import React, { useState, useEffect } from 'react'
import { FlatList } from 'react-native'
import { WsEmpty, WsSkeleton, WsLoading } from '@/components'
import moment from 'moment'

const WsInfiniteScrollMultiple = props => {
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
    parentId,
    params,
    pageKey = 'page',
    lastPageKey = 'last_page',
    currentPageKey = 'current_page',
    serviceFormatKey,
    services = [],
    hasMeta = true,
    getAll = false,
    getResData,
    getFormatedModels,
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
    onItemsFetch = () => { }
  } = props

  // State
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  const [currentService, setCurrentService] = useState(services[0])
  const [models, setModels] = useState([])
  const [fModels, setFModels] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [isFetching, setIsFetching] = useState(false)
  const [isRefreshing_C, setIsRefreshing_C] = useState(false)
  const [isFinalRound, setIsFinalRound] = useState(false)
  const [clear, setClear] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Function
  const $_fetchModels = async () => {
    if (hasMeta && lastPage <= currentPage && mode == 'page') {
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
    }
    const res = await currentService[serviceIndexKey]({
      token: token,
      params: _params,
      parentId: parentId
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
      setIsLoaded(true)
      if (hasMeta) {
        setLastPage(res.meta[lastPageKey])
        setCurrentPage(parseInt(res.meta[currentPageKey]))
        if (res.meta[lastPageKey] == res.meta[currentPageKey]) {
          if (currentServiceIndex < services.length - 1) {
            setCurrentService(services[currentServiceIndex + 1])
            setCurrentServiceIndex(currentServiceIndex + 1)
          }
        }
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
        return e.id == _model.id && e.serviceIndex == currentServiceIndex
      })
      if (!target) {
        _models.push({
          ..._model,
          serviceIndex: currentServiceIndex
        })
      }
    })
    setModels([...models, ..._models])

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
      const formated = await currentService[serviceFormatKey](models)
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
    setLastPage(1)
    setCurrentPage(0)
    if (isLoaded && currentPage == 0) {
      $_fetchModels()
    }
  }, [currentServiceIndex])

  // Render
  return (
    <>
      <FlatList
        keyExtractor={({ item, index }) => item}
        data={fModels}
        renderItem={({ item, index }) => {
          return renderItem({
            item,
            index,
            items: fModels
          })
        }}
        onRefresh={$_onRefresh}
        refreshing={isRefreshing_C}
        ListHeaderComponent={ListHeaderComponent}
        onEndReached={$_onEndReached}
        onEndReachedThreshold={0.2}
        progressViewOffset={0}
        style={[
          {
            padding: padding,
            height: 400
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

export default WsInfiniteScrollMultiple
