import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native'
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
  WsBtn,
  LlTaskDraftCard001
} from '@/components'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import AsyncStorage from '@react-native-community/async-storage'

const MyTasks = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

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
  const [sortValue, setSortValue] = React.useState('advance')
  const [sortValue002, setSortValue002] = React.useState('依期限由近至遠')

  const [loading, setLoading] = React.useState(true)
  const [myTasks, setMyTasks] = React.useState()
  const [myTasksCount, setMyTasksCount] = React.useState()

  const [currentPage, setCurrentPage] = React.useState(1)
  const [lastPage, setLastPage] = React.useState(1)

  // Services
  const $_getMyTasks = async () => {
    setLoading(true)
    console.log('$_getMyTasks');
    try {
      let _params = {
        order_by: 'expired_at',
        order_way: 'desc',
        // get_all: 1
        page: 1
      }
      _params = S_Task.getPickerParams001(_params, sortValue, sortValue002)
      // 取得我的任務
      const res = await S_Task.getAuthTasks({ params: _params })
      setMyTasks(res.data)
      if (res.meta) {
        setMyTasksCount(res.meta?.total)
        setLastPage(res.meta?.last_page)
      } else {
        setMyTasksCount(res.data.length)
        setLastPage(1)
      }
      setLoading(false)
      setRefreshing(false)
    } catch (e) {
      console.error(e);
    }
  }
  // 取得我的任務-載入更多
  const $_getMyTasksMore = async () => {
    let _params = {
      order_by: 'expired_at',
      order_way: 'desc',
      page: currentPage
    }
    _params = S_Task.getPickerParams(_params, sortValue, sortValue002)
    const res = await S_Task.getAuthTasks({ params: _params })
    const more = res.data
    const _tasks = [...myTasks, ...more]
    setMyTasks(_tasks)
    setMyTasksCount(_tasks?.length)
  }
  // 取得草稿
  const $_getMyTaskDrafts = async () => {
    setLoading(true)
    try {
      let _params = {
        order_by: 'updated_at',
        order_way: 'desc',
        get_all: 1
      }
      // 取得我的任務
      const res = await S_Task.authIndexDraft({ params: _params })
      // console.log(res, 'res--');
      setMyTasks(res.data)
      if (res.meta) {
        setMyTasksCount(res.meta.total)
      } else {
        setMyTasksCount(res.data.length)
      }
      setLoading(false)
      setRefreshing(false)
    } catch (e) {
      console.error(e);
    }
  }

  // FUNCTION
  const $_onProcedurePress = () => {
    navigation.push('RoutesTask', {
      screen: 'TaskIndex'
    })
  }

  React.useEffect(() => {
    if (tabFocus === 'my_tasks') {
      $_getMyTasks()
      setCurrentPage(1)
    } else if (tabFocus === 'my_task_draft') {
      $_getMyTaskDrafts()
    }
  }, [currentFactory, tabFocus, refreshing, sortValue, sortValue002])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入 MyTasks');
      if (tabFocus === 'my_task_draft') {
        $_getMyTaskDrafts()
      } else if (tabFocus === 'my_tasks') {
        $_getMyTasks()
      }
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('離開 MyTasks');
    });
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation, tabFocus, currentFactory, refreshing, sortValue, sortValue002]);

  React.useEffect(() => {
    if (currentPage > 1) {
      $_getMyTasksMore()
    }
  }, [currentPage])

  return (
    <>
      {
        (tabFocus === 'my_tasks' || tabFocus === 'my_task_draft') &&
          myTasks ? (
          <>
            <View
              style={{
                padding: 16
              }}
            >
              {tabFocus === 'my_tasks' && (
                <WsFlex
                  style={{
                    marginBottom: 16,
                  }}
                >
                  <WsState
                    style={{
                      flex: 1,
                      borderColor: $color.gray
                    }}
                    borderWidth={0.3}
                    borderRadius={10}
                    type="picker"
                    value={sortValue}
                    onChange={e => {
                      setSortValue(e)
                      _setSortValue(e)
                    }}
                    placeholder={i18next.t('排序方式')}
                    items={[
                      {
                        label: i18next.t('全部'),
                        value: 'all'
                      },
                      {
                        label: i18next.t('進行中'),
                        value: 'advance'
                      },
                      {
                        label: i18next.t('待我審核'),
                        value: 'pending'
                      },
                      {
                        label: i18next.t('已完成'),
                        value: 'complete'
                      },
                    ]}
                  />
                  <WsState
                    style={{
                      marginLeft: 16,
                      flex: 1,
                      borderColor: $color.gray
                    }}
                    borderWidth={0.3}
                    borderRadius={10}
                    type="picker"
                    value={sortValue002}
                    onChange={e => {
                      setSortValue002(e)
                      _setSortValue002(e)
                    }}
                    items={[
                      {
                        label: i18next.t('依期限由近至遠'),
                        value: '依期限由近至遠'
                      },
                      {
                        label: i18next.t('依進度完成由低至高'),
                        value: '依進度完成由低至高'
                      }
                    ]}
                  />
                </WsFlex>
              )}

              {loading ? (
                <WsSkeleton></WsSkeleton>
              ) : (
                <>

                  {tabFocus === 'my_tasks' && (
                    <WsText
                      style={{
                        padding: 8
                      }}
                      fontWeight="bold"
                      textAlign="center">
                      {`${sortValue === 'advance' ? i18next.t('進行中') :
                        sortValue === 'pending' ? i18next.t('待我審核') :
                          sortValue === 'complete' ? i18next.t('已完成') : '全部'}( ${myTasks && myTasks.length > 0 ? myTasks.length : 0} )`}
                    </WsText>
                  )}

                  <FlatList
                    data={myTasks}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => {
                      return (
                        <>
                          {tabFocus === 'my_tasks' && (
                            <LlTaskCard001
                              key={index}
                              item={item}
                              onPress={async () => {
                                if (tabFocus === 'my_tasks') {
                                  navigation.push('RoutesTask', {
                                    screen: 'TaskShow',
                                    params: {
                                      id: item.id,
                                      taskStatus: sortValue ? sortValue : undefined,
                                    }
                                  })
                                } else if (tabFocus === 'my_task_draft') {
                                  try {
                                    console.log(item.id, 'item.id000');
                                    const res = await S_Task.show({ modelId: item.id });
                                    const _formatted = S_Task.transformTaskLinksToRelatedModules(res)
                                    const _task = JSON.stringify(_formatted)
                                    await AsyncStorage.setItem('TaskUpdateDraft', _task)
                                    navigation.push('RoutesTask', {
                                      screen: 'TaskUpdateDraft',
                                      params: {
                                        id: item.id,
                                      }
                                    })
                                  } catch (error) {
                                    console.error(error);
                                  }
                                }
                              }}
                              style={{
                                marginTop: 8
                              }}
                            />
                          )}
                          {tabFocus === 'my_task_draft' && (
                            <LlTaskDraftCard001
                              key={index}
                              item={item}
                              onPress={async () => {
                                if (tabFocus === 'my_tasks') {
                                  navigation.push('RoutesTask', {
                                    screen: 'TaskShow',
                                    params: {
                                      id: item.id,
                                      taskStatus: sortValue ? sortValue : undefined,
                                    }
                                  })
                                } else if (tabFocus === 'my_task_draft') {
                                  try {
                                    console.log(item.id, 'item.id000');
                                    const res = await S_Task.show({ modelId: item.id });
                                    const _formatted = S_Task.transformTaskLinksToRelatedModules(res)
                                    const _task = JSON.stringify(_formatted)
                                    await AsyncStorage.setItem('TaskUpdateDraft', _task)
                                    navigation.push('RoutesTask', {
                                      screen: 'TaskUpdateDraft',
                                      params: {
                                        id: item.id,
                                      }
                                    })
                                  } catch (error) {
                                    console.error(error);
                                  }
                                }
                              }}
                              style={{
                                marginTop: 8
                              }}
                            />
                          )}
                        </>
                      )
                    }}
                    ListFooterComponent={() => {
                      return (
                        <>
                          {currentPage !== lastPage &&
                            tabFocus === 'my_tasks' && (
                              <View
                                style={{
                                  marginTop: 8,
                                  marginHorizontal: 8
                                }}
                              >
                                <WsBtn
                                  onPress={() => {
                                    if (currentPage !== lastPage) {
                                      setCurrentPage(currentPage + 1)
                                    }
                                  }}
                                  style={{
                                  }}
                                  borderColor={$color.gray}
                                  borderWidth={0.4}
                                  isFullWidth={false}
                                  textColor={$color.gray}
                                  color={$color.white}
                                  borderRadius={25}>
                                  {t('載入更多')}
                                </WsBtn>
                              </View>
                            )}

                          {tabFocus === 'my_tasks' && (
                            <WsGradientButton
                              borderRadius={30}
                              style={{
                                marginTop: 16,
                              }}
                              onPress={$_onProcedurePress}
                            >
                              {t('前往列表')}
                            </WsGradientButton>
                          )}
                          <View
                            style={{
                              height: 60,
                            }}
                          >
                          </View>
                        </>

                      )
                    }}
                    ListEmptyComponent={() => {
                      return (
                        <WsEmpty />
                      )
                    }}
                  />
                </>
              )}
            </View>
          </>
        ) : (
          <WsSkeleton></WsSkeleton>
        )
      }
    </>
  )
}

export default MyTasks
