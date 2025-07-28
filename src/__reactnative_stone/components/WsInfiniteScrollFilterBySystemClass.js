import React, { useState, useEffect } from 'react'
import { FlatList, View, Text, Pressable } from 'react-native'
import {
  WsEmpty,
  WsSkeleton,
  WsLoading,
  WsText,
  WsTag,
  WsFlex
} from '@/components'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import store from '@/store'
import { useSelector } from 'react-redux'
import { setCurrentCheckList } from '@/store/data'

const WsInfiniteScrollFilterBySystemClass = props => {
  const navigation = useNavigation()

  // Prop
  const {
    mode = 'page',
    height = 400,
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
    padding = 0,
    serviceIndexKey = 'index',
    isRefreshing = false,
    onRefreshed,
    emptyTitle,
    emptyText,
    onItemsFetch = () => { }
  } = props

  const [fModels, setFModels] = useState()
  const [isRefreshing_C, setIsRefreshing_C] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const $_onRefresh = () => {
    setIsRefreshing_C(true)
    $_clear()
  }
  const $_clear = () => {
    setFModels([])
    $_updateFModels()
  }

  const $_updateFModels = async () => {
    const res = await service[serviceIndexKey]({
      params: params
    })
    setFModels(res.data)
    setIsRefreshing_C(false)
    setLoading(false)
  }

  // Effect
  useEffect(() => {
    $_updateFModels()
  }, [params, navigation])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action and update data
      $_updateFModels()
    })
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])


  // Render
  return (
    <>
      {!loading && fModels && fModels.length > 0 && (
        <FlatList
          style={{
            padding: padding,
            flex: 1
          }}
          keyExtractor={(item, index) => item + index}
          data={fModels}
          renderItem={({ item, index }) => {
            return renderItem({
              item,
              index,
              setSelectedId
            })
          }}
          onRefresh={$_onRefresh}
          refreshing={isRefreshing_C}
          extraData={selectedId}
        />
      )}
      {!loading && fModels && fModels.length === 0 && (
        <WsEmpty emptyTitle={emptyTitle} emptyText={emptyText} />
      )}
      {loading && <WsSkeleton />}
    </>
  )
}

export default WsInfiniteScrollFilterBySystemClass
