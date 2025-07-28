import React, { useState, useEffect } from 'react'
import { View, ScrollView, SafeAreaView, FlatList, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import S_Task from '@/services/api/v1/task'
import {
  LlTaskCard001,
  WsInfiniteScroll,
  WsBottomRoundContainer,
  WsSkeleton,
  WsEmpty,
  WsGradientButton,
  WsState,
  WsFlex,
  WsText,
  WsTabView,
  WsToggleTabBar
} from '@/components'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import MyTasks from '@/sections/MyTasks'

const MyTaskTabs = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    tabFocus,
    route,
    refreshing,
    setRefreshing,
    _setSortValue,
    _setSortValue002
  } = props

  // redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [tabFocus002, setTabFocus002] = useState('my_tasks')
  const [toggleTabs002, setToggleTabs002] = useState([
    {
      value: 'my_tasks',
      label: t('任務'),
    },
    {
      value: 'my_task_draft',
      label: t('草稿'),
    },
  ])

  return (
    <>
      {toggleTabs002 &&
        tabFocus === 'mytask' ? (
          <View
            style={{
              paddingHorizontal: 16
            }}
          >
            <WsToggleTabBar
              style={{
                marginTop: 10
              }}
              value={tabFocus002}
              items={toggleTabs002}
              onPress={($event) => {
                setTabFocus002($event)
              }}
            />
          </View>
        ):(
          <WsSkeleton></WsSkeleton>
        )}

      <MyTasks
        tabFocus={tabFocus002}
        route={route}
        refreshing={refreshing}
        setRefreshing={setRefreshing}
        _setSortValue={(e) => {
          _setSortValue(e)
        }}
        _setSortValue002={_setSortValue002}
      >
      </MyTasks>
    </>
  )
}

export default MyTaskTabs
