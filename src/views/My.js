import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  SafeAreaView
} from 'react-native'
import {
  WsNavButton,
} from '@/components'
import {
  WsGrid,
  WsText,
  WsPaddingContainer,
  WsIconBtn,
  WsBadgeButton,
  WsBadgeIconButton,
  WsToggleTabBar,
  WsBottomRoundContainer,
  WsGradientButton,
  WsSkeleton
} from '@/components'
import store from '@/store'
import $color from '@/__reactnative_stone/global/color'
import MySubtasks from '@/sections/MySubtasks'
import MyTasks from '@/sections/MyTasks'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import { useTranslation } from 'react-i18next'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import AsyncStorage from '@react-native-community/async-storage';
import config from '@/__config'
import { useIsFocused } from '@react-navigation/native';
import S_SubTask from '@/services/api/v1/sub_task'
import S_Task from '@/services/api/v1/task'
import S_Init from '@/__reactnative_stone/services/app/Init'
import { setIdleCounter } from '@/store/data';
import { useNavigationState } from '@react-navigation/native';
import S_QRcode from '@/services/api/v1/qrcode'
import MyTaskTabs from '@/sections/MyKanban/MyTaskTabs';
import {
  setInitUrlFromQRcode
} from '@/store/data'
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const My = ({ route }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const routeName = useNavigationState(state => state.routes[state.index].name);
  const _tabFocus = route.params?.tabFocus

  // Redux
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentInitUrlFromQRcode = useSelector(state => state.data.initUrlFromQRcode)

  // State
  const [initFirebaseMessage, setInitFirebaseMessage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [_sortValue, _setSortValue] = React.useState('隱藏已完成項目')
  const [_sortValue002, _setSortValue002] = React.useState('依效期由近至遠')

  const [checklistNum, setChecklistNum] = React.useState()
  const [mainMenu, setMainMenu] = React.useState([])
  const [tabFocus, setTabFocus] = useState()
  const [toggleTabs, setToggleTabs] = useState([
    {
      value: 'mysubtask',
      label: t('我的待辦'),
    },
    {
      value: 'mytask',
      label: t('我的任務'),
    },
  ])

  // Services
  const $_fetchChecklist = async () => {
    if (currentFactory) {
      const res = await S_UserCheckList.index({ parentId: currentFactory.id })
      setChecklistNum(res.meta.total)
    }
  }

  // INIT
  const $_initManageList = () => {
    const _menu = [
      {
        icon: "ll-nav-checksheet-outline",
        name: t("點檢作業"),
        onPress: () => {
          navigation.push('RoutesCheckList', {
            screen: 'CheckListAssignment'
          })
        },
        permission: scopePermission(['checklist-record-checker', 'checklist-record-manager'], currentUserScope) && (currentViewMode == 'organization' ? scopeSubscriptions(currentOrganization, 'checklist') : scopeSubscriptions(currentFactory, 'checklist'))
      },
      {
        icon: "ll-nav-audit-outline",
        name: t("稽核作業"),
        onPress: () => {
          navigation.push('RoutesAudit', {
            screen: 'AuditAssignment'
          })
        },
        permission: scopePermission(
          [
            'audit-read',
            'audit-record',
            'auditee-record'
          ]
          , currentUserScope) && (currentViewMode == 'organization' ? scopeSubscriptions(currentOrganization, 'audit') : scopeSubscriptions(currentFactory, 'audit'))
      },
      {
        icon: "ll-nav-entry-outline",
        name: t("進場管理"),
        onPress: () => {
          navigation.push('RoutesContractorEnter', {
            screen: 'ContractorEnterRecord'
          })
        },
        permission: scopePermission('contractor-enter-record-read', currentUserScope) && (currentViewMode == 'organization' ? scopeSubscriptions(currentOrganization, 'contractor') : scopeSubscriptions(currentFactory, 'contractor'))
      },
      {
        icon: "ll-nav-event-outline",
        name: t("新增事件"),
        onPress: () => {
          navigation.push('RoutesEvent', {
            screen: 'EventPickTypeTemplate'
          })
        },
        permission: scopePermission('event-create', currentUserScope) && (currentViewMode == 'organization' ? scopeSubscriptions(currentOrganization, 'event') : scopeSubscriptions(currentFactory, 'event'))
      },
      {
        icon: "ll-nav-change-outline",
        name: t("變動作業"),
        onPress: () => {
          navigation.push('RoutesChange', {
            screen: 'ChangeAssignmentIndex'
          })
        },
        permission: scopePermission('change-record', currentUserScope) && (currentViewMode == 'organization' ? scopeSubscriptions(currentOrganization, 'change') : scopeSubscriptions(currentFactory, 'change'))
      },
      {
        icon: "ll-nav-add-assignment",
        name: t("建立任務"),
        onPress: async () => {
          await AsyncStorage.removeItem('TaskCreate')
          navigation.push('RoutesTask', {
            screen: 'TaskCreateFromMy'
          })
        },
        permission: scopePermission('task-create', currentUserScope)
      },
      {
        icon: "ws-outline-calendar-date",
        name: t("本場行程"),
        onPress: () => {
          navigation.push('BoardCalendar')
        },
        permission: true
      },
      {
        icon: "ws-outline-search",
        name: t("查詢法規"),
        onPress: () => {
          navigation.push('RoutesAct', {
            screen: 'ActIndex'
          })
        },
        permission: scopePermission('act-read', currentUserScope)
      },
    ]
    setMainMenu(_menu)
    setRefreshing(false)
  }

  // Services
  const $_initBadge = async () => {
    let _params = {
      status: 'expired',
    }
    // 我的待辦-逾期
    _params = S_SubTask.getPickerParams(_params, _sortValue, _sortValue002)
    const _expired = await S_SubTask.getAuthSubtasks({ params: _params })
    // 我的待辦-即將到來
    let _params2 = {
      status: 'upcoming',
    }
    _params2 = S_SubTask.getPickerParams(_params2, _sortValue, _sortValue002)
    const _upcoming = await S_SubTask.getAuthSubtasks({ params: _params2 })
    // 取得我的任務
    const _paramsTasks = {
      order_by: 'expired_at',
      order_way: 'desc',
      done_at: 'null',
    }
    _params = S_Task.getPickerParams001(_paramsTasks, _sortValue, _sortValue002)
    const _myTasks = await S_Task.getAuthTasks({ params: _params })
    Promise.all([_expired, _upcoming, _myTasks])
      .then(res => {
        setToggleTabs([
          {
            value: 'mysubtask',
            label: t('我的待辦'),
            badge: res[0].meta.total + res[1].meta.total
          },
          {
            value: 'mytask',
            label: t('我的任務'),
            badge: res[2].meta.total
          },
        ])
        setRefreshing(false)
      })
      .catch(error => {
        console.error(error);
        setRefreshing(false)
      })
  }

  // REFRESH CONTROL
  const fetchData = () => {
    setRefreshing(true);
    setTimeout(() => {
      $_fetchChecklist()
      $_initManageList()
    }, 0);
  };

  const handleScroll = (event) => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  };

  // URL REDIRECT
  const $_redirect = async () => {
    if (currentInitUrlFromQRcode) {
      await S_QRcode.redirectByScanUrl(currentInitUrlFromQRcode, navigation);
      store.dispatch(setInitUrlFromQRcode(null))
    }
  }

  useEffect(() => {
    if (isFocused) {
      setLoading(false)
    }
  }, [isFocused]);

  React.useEffect(() => {
    $_initManageList()
  }, [currentFactory, currentUserScope])

  React.useEffect(() => {
    setTabFocus('mysubtask')
    $_fetchChecklist()
  }, [currentFactory])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入 看板頁面');
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('離開 看板頁面');
    });
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  React.useEffect(() => {
    $_redirect();
  }, [currentInitUrlFromQRcode])


  // Render
  return (
    <>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: $color.primary
          }}
        >
          <ScrollView
            scrollEventThrottle={16}
            testID={'ScrollView'}
            style={{
              backgroundColor: $color.primary11l,
            }}
            onScroll={handleScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchData}
                tintColor="transparent"
                progressBackgroundColor="transparent"
              />
            }
          >
            {!loading && mainMenu ? (
              <>
                <View
                  testID="ViewMy"
                  style={{
                    padding: 16,
                    paddingBottom: 24,
                    backgroundColor: $color.primary,
                  }}
                >
                  <WsGrid
                    style={{
                      alignItems: 'flex-start',
                    }}
                    numColumns={4}
                    data={mainMenu}
                    keyExtractor={item => item.name}
                    renderItem={({ item, index }) => (
                      <WsBadgeIconButton
                        testID={item.name}
                        key={item.id}
                        style={{
                          marginBottom: 16,
                        }}
                        disable={!item.permission}
                        icon={item.permission === false ? 'ws-outline-lock' : item.icon}
                        name={item.name}
                        badge={item.badge}
                        onPress={item.permission === true ? item.onPress : () => { }}
                      />
                    )}
                  />
                  <WsToggleTabBar
                    style={{
                      marginTop: 10
                    }}
                    value={tabFocus}
                    items={toggleTabs}
                    onPress={($event) => {
                      setTabFocus($event)
                    }}
                  />
                </View>

                <MySubtasks
                  tabFocus={tabFocus}
                  _setSortValue={_setSortValue}
                  _setSortValue002={_setSortValue002}>
                </MySubtasks>

                {tabFocus === 'mytask' && (
                  <MyTaskTabs
                    tabFocus={tabFocus}
                    route={route}
                    refreshing={refreshing}
                    setRefreshing={setRefreshing}
                    _setSortValue={(e) => {
                      _setSortValue(e)
                    }}
                    _setSortValue002={_setSortValue002}
                  ></MyTaskTabs>
                )}

              </>
            ) : (
              <WsSkeleton></WsSkeleton>
            )}

          </ScrollView>
        </SafeAreaView>
    </>
  )
}
export default My;