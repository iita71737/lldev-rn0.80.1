import React, { useState } from 'react'
import {
  View,
  FlatList,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView
} from 'react-native'
import {
  WsAnalyzeCard,
  WsBtn,
  WsText,
  WsFlex,
  WsStatePicker,
  WsState,
  WsGrid,
  WsPaddingContainer,
  WsCharts,
  WsChartsModels,
  WsSkeleton,
  WsDashboardSearchCard,
  WsLoadingImageSwitch,
  WsLoading,
  WsPopup,
  LlLvInfoMultiLayer
} from '@/components'
import store from '@/store'
import { useSelector } from 'react-redux'
import { setDataFail } from '@/store/data'
import $color from '@/__reactnative_stone/global/color'
import S_TaskMonth from '@/services/api/v1/task_month'
import S_AlertMonth from '@/services/api/v1/alert_month'
import S_EventMonth from '@/services/api/v1/event_month'
import S_FactoryTotalAnalysis from '@/services/api/v1/factory_total'
import S_SystemClassAnalysis from '@/services/api/v1/systemclass_analysis'
import S_ContractorEnterRecordMonth from '@/services/api/v1/contractor_enter_record_month'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import ViewRankingList from '@/sections/Dashboard/RankingList'
import { useFocusEffect } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native'
import S_EventType from '@/services/api/v1/event_type'
import S_Factory from '@/services/api/v1/factory'
import H_factory from "@/helpers/factory"
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import {
  setIdleCounter
} from '@/store/data';
import { useNavigationState } from '@react-navigation/native';
import S_Locale from '@/services/api/v1/locale'
import H_time from '@/helpers/time';

const Dashboard = ({ navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { windowWidth, windowHeight } = layouts
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const isFocused = useIsFocused()
  const routeName = useNavigationState(state => state.routes[state.index].name);

  // Redux
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentConnectionState = useSelector(state => state.data.connectionState)

  // State
  const [refreshing, setRefreshing] = useState(false);

  const [popupActive, setPopupActive] = React.useState(false)
  const [sortValue, setSortValue] = React.useState()
  const [factoryFilter, setFactoryFilter] = React.useState()

  const [loading, setLoading] = React.useState(true)
  const [systemClassesFields, setSystemClassesFields] = React.useState()
  const [systemClassesAlertFields, setSystemClassesAlertFields] = React.useState()
  const [topAnalyzeData, setTopAnalyzeData] = React.useState([])

  // Alert Chart States
  const [alertTabItems, setAlertTabItems] = React.useState([
    {
      value: 'alert',
      label: t('警示')
    },
    {
      value: 'remind',
      label: t('預警')
    }
  ])
  const [alertParams, setAlertParams] = React.useState({
    level: 2,
    system_class: 'all',
    time_field: 'created_at'
  })
  const [pickerItemsForAlert, setPickItemsForAlert] = React.useState([])
  const [pickerValueForAlert, setPickerValueForAlert] = React.useState()

  // Event Chart States
  const [eventTabItems, setEventTabItems] = React.useState([
    {
      value: 'all',
      label: t('全部')
    },
    {
      value: 'attention',
      label: t('意外事故')
    },
    {
      value: 'outside',
      label: t('外部稽查') // 要改成來自後台
    },
    {
      value: 'ticket',
      label: t('罰單')
    },
    {
      value: 'error',
      label: t('操作異常')
    },
    {
      value: 'other',
      label: t('其他')
    }
  ])
  const [eventParams, setEventParams] = React.useState({
    event_type: 'all',
    system_class: 'all',
    time_field: 'created_at'
  })
  const [eventTypes, setEventTypes] = React.useState([
    { label: t('全部'), value: 'all' },
  ])
  const [pickerValue002ForEvent, setPickerValue002ForEvent] = React.useState()
  const [pickerItemsForEvent, setPickItemsForEvent] = React.useState([
    { label: t('example1'), value: null },
    { label: t('example2'), value: 16 }
  ])
  const [pickerValueForEvent, setPickerValueForEvent] = React.useState()

  // PICKER_INIT
  const $_setFactoryDropdown = async () => {
    // console.log(JSON.stringify(currentOrganization),'currentOrganization3333-');
    try {
      const params = {
        organization: currentOrganization ? currentOrganization.id : currentFactory.id
      }
      const res = await S_Factory.userIndex({ params })
      let _selectArr = []
      if (currentViewMode == 'organization') {
        _selectArr.push(currentOrganization)
        setFactoryFilter(_selectArr)
        setSortValue(currentOrganization)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Task Chart States
  const [taskParams, setTaskParams] = React.useState({
    system_class: 'all'
  })
  const [pickerItemsForTask, setPickItemsForTask] = React.useState([
    { label: t('example1'), value: null },
    { label: t('example2'), value: 16 }
  ])
  const [pickerValueForTask, setPickerValueForTask] = React.useState()

  // ContractorEnter Chart State
  const [contractorEnterParams, setContractorEnterParams] = React.useState({
    system_class: 'all'
  })
  const [pickerItemsForContractorEnter, setPickItemsForContractorEnter] =
    React.useState([
      { label: t('example1'), value: null },
      { label: t('example2'), value: 16 }
    ])
  const [pickerValueForContractorEnter, setPickerValueForContractorEnter] =
    React.useState()

  // Checklist Ranking States
  // const [rankingTabs, setRankingTabs] = React.useState()
  const [rankingTabIndex, setRankingTabIndex] = React.useState(0)
  const [rankingParams, setRankingParams] = React.useState({
    page: 1,
    system_classes: systemClasses.map(_ => _.id).toString(),
    type: 'checklist',
    start_time: moment().subtract(3, 'months').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD')
  })
  const [FilterValueForChecklistRanking, setFilterValueForChecklistRanking] =
    React.useState()
  // const [fieldsForChecklistRanking, setFieldsForChecklistRanking] =
  //   React.useState({
  //     time_period: {
  //       type: 'picker',
  //       items: [
  //         {
  //           label: t('近三個月'),
  //           value: '3months'
  //         },
  //         {
  //           label: t('近一年'),
  //           value: '1year'
  //         },
  //         {
  //           label: t('否'),
  //           value: 0
  //         }
  //       ]
  //     },
  //     system_classes: {
  //       type: 'picker',
  //       items: [{
  //         label: t('全部'),
  //         value: systemClasses.map(_ => _.id).toString()
  //       }]
  //     }
  //   })

  // Checklist-Template Ranking States
  // const [rankingTabsForChecklistTemplate, setRankingTabsForChecklistTemplate] =
  //   React.useState([
  //     {
  //       value: 'CheckListDaily',
  //       label: t('每日'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('點檢不合規題目'),
  //         frequency: 'day',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListWeekly',
  //       label: t('每週'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('每週'),
  //         frequency: 'week',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListMonthly',
  //       label: t('每月'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('每月'),
  //         frequency: 'month',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListSeasonly',
  //       label: t('每季'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('每季'),
  //         frequency: 'season',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListYearly',
  //       label: t('每年'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('每年'),
  //         frequency: 'yearly',
  //         rankingParams: rankingParams
  //       }
  //     }
  //   ])
  const [
    rankingTabIndexForChecklistTemplate,
    setRankingTabIndexForChecklistTemplate
  ] = React.useState(0)
  const [
    rankingParamsForChecklistTemplate,
    setRankingParamsForChecklistTemplate
  ] = React.useState({
    page: 1,
    system_classes: systemClasses.map(_ => _.id).toString(),
    type: 'checklist-template',
    start_time: moment().subtract(3, 'months').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD')
  })
  const [
    FilterValueForChecklistTemplateRanking,
    setFilterValueForChecklistTemplateRanking
  ] = React.useState()
  const [
    fieldsForChecklistTemplateRanking,
    setFieldsForChecklistTemplateRanking
  ] = React.useState({
    time_period: {
      type: 'picker',
      items: [
        {
          label: t('近三個月'),
          value: '3months'
        },
        {
          label: t('近一年'),
          value: '1year'
        },
        { label: t('否'), value: 0 }
      ]
    },
    system_classes: {
      type: 'picker',
      items: [{
        label: t('全部'),
        value: systemClasses.map(_ => _.id).toString()
      }]
    }
  })

  // Audit Ranking States
  // const [rankingTabsForAuditRanking, setRankingTabsForAuditRanking] =
  //   React.useState([
  //     {
  //       view: ViewRankingList,
  //       props: {
  //         label: t('稽核不合規題目'),
  //         rankingParams: rankingParamsForAuditRanking
  //       }
  //     }
  //   ])
  const [rankingTabIndexForAuditRanking, setRankingTabIndexForAuditRanking] =
    React.useState(0)
  const [rankingParamsForAuditRanking, setRankingParamsForAuditRanking] =
    React.useState({
      page: 1,
      system_classes: systemClasses.map(_ => _.id).toString(),
      type: 'audit',
      start_time: moment().subtract(90, 'days').format('YYYY-MM-DD'),
      end_time: moment().format('YYYY-MM-DD')
    })
  const [FilterValueForAuditRanking, setFilterValueForAuditRanking] =
    React.useState()
  const [fieldsForAuditRanking, setFieldsForAuditRanking] = React.useState({
    time_period: {
      type: 'picker',
      items: [
        {
          label: t('近三個月'),
          value: '3months'
        },
        {
          label: t('近一年'),
          value: '1year'
        },
        { label: t('否'), value: 0 }
      ]
    },
    system_classes: {
      type: 'picker',
      items: [{
        label: t('全部'),
        value: systemClasses.map(_ => _.id).toString()
      }]
    }
  })

  // Audit-Template Ranking States
  const [
    rankingTabsForAuditTemplateRanking,
    setRankingTabsForAuditTemplateRanking
  ] = React.useState([
    {
      view: ViewRankingList,
      props: {
        label: t('稽核公版不合規題目'),
        rankingParams: rankingParamsForAuditTemplateRanking
      }
    }
  ])
  const [
    rankingTabIndexForAuditTemplateRanking,
    setRankingTabIndexForAuditTemplateRanking
  ] = React.useState(0)
  const [
    rankingParamsForAuditTemplateRanking,
    setRankingParamsForAuditTemplateRanking
  ] = React.useState({
    page: 1,
    system_classes: systemClasses.map(_ => _.id).toString(),
    type: 'audit-template',
    start_time: moment().subtract(90, 'days').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD')
  })
  const [
    FilterValueForAuditTemplateRanking,
    setFilterValueForAuditTemplateRanking
  ] = React.useState()
  const [fieldsForAuditTemplateRanking, setFieldsForAuditTemplateRanking] =
    React.useState({
      time_period: {
        type: 'picker',
        items: [
          {
            label: t('近三個月'),
            value: '3months'
          },
          {
            label: t('近一年'),
            value: '1year'
          },
          { label: t('否'), value: 0 }
        ]
      },
      system_classes: {
        type: 'picker',
        items: [{
          label: t('全部'),
          value: systemClasses.map(_ => _.id).toString()
        }]
      }
    })

  // FUNC
  const $_selectFactories = async (unit) => {
    try {
      if (!unit) {
        return
      }
      setLoading(true)
      const totalRes = await S_FactoryTotalAnalysis.indexV2({
        params: {
          factory: unit.id,
          organization: currentOrganization.id,
          start_time: moment().format('YYYY-MM-DD'),
          end_time: moment().format('YYYY-MM-DD'),
          time_field: 'created_at'
        }
      })
      const _numberData = S_SystemClassAnalysis.setNumberCardData_v2(totalRes.data)
      setTopAnalyzeData(_numberData)
      setSortValue(unit)
      setLoading(false)
      setPopupActive(false)
    } catch (e) {
      console.error(e);
    }
  }

  // Services
  const $_fetchCardsInit = async () => {
    try {
      const _timeZone = currentUser?.current_factory?.timezone
      const { start, end } = H_time.getFactoryDayStartEndTime(_timeZone ? _timeZone : 'Asia/Taipei')
      const _params = {
        factory: sortValue ? sortValue.id : currentViewMode === 'organization' && currentOrganization ? currentOrganization.id : currentFactory ? currentFactory.id : undefined,
        start_time: start ? start : moment().format('YYYY-MM-DD'),
        end_time: end ? end : moment().format('YYYY-MM-DD'),
        time_field: 'created_at'
      }
      console.log(_params, '_params');
      const totalRes = await S_FactoryTotalAnalysis.indexV2({
        params: _params
      })
      if (totalRes) {
        const _numberData = S_SystemClassAnalysis.setNumberCardData_v2(totalRes.data)
        setTopAnalyzeData(_numberData)
        setLoading(false)
      }
    } catch (e) {
      const _numberData = S_SystemClassAnalysis.setNumberCardData_v2()
      setTopAnalyzeData(_numberData)
      console.error(e);
    }
  }

  // Initial Dropdown Menu 初始化篩選選項
  const $_setPickItems = () => {
    const _systemClasses = JSON.parse(JSON.stringify(systemClasses))
    const init = []
    const PickItemArr = []
    _systemClasses.forEach(systemClass => {
      init.push(systemClass.id)
      PickItemArr[0] = {
        label: t('全部'),
        value: init.toString()
      }
    })
    _systemClasses.forEach(systemClass => {
      PickItemArr.push({
        label: systemClass.name,
        value: systemClass.id
      })
    })
    setPickItemsForAlert(PickItemArr)
    setPickItemsForEvent(PickItemArr)
    setPickItemsForTask(PickItemArr)
    setPickItemsForContractorEnter(PickItemArr)
    $_setChartFieldsForChecklistRanking(PickItemArr)
  }

  // Initial PickItems Fields 初始化篩選條件的欄位
  const $_setChartFieldsForChecklistRanking = pickItems => {
    const _fields = {
      time_period: {
        testID: '時間區間picker',
        type: 'picker',
        items: [
          {
            label: t('近三個月'),
            value: '3months'
          },
          {
            label: t('近一年'),
            value: '1year'
          },
          {
            label: t('自訂'),
            value: 'custom'
          }
        ],
        updateValueOnChange: value => {
          if (value === 1) {
            return {
              start_time: moment().add(-1, 'year').format('YYYY-MM-DD'),
              end_time: moment().format('YYYY-MM-DD')
            }
          } else {
            return false
          }
        }
      },
      start_time: {
        type: 'date',
        label: t('開始日期'),
        displayCheck(fieldsValue) {
          if (fieldsValue.time_period == 'custom') {
            return true
          } else {
            return false
          }
        }
      },
      end_time: {
        type: 'date',
        label: t('結束日期'),
        displayCheck(fieldsValue) {
          if (fieldsValue.time_period == 'custom') {
            return true
          } else {
            return false
          }
        }
      },
      system_classes: {
        testID: '領域picker',
        type: 'picker',
        items: pickItems,
        defaultValue: pickItems[0]
      }
    }
    // setFieldsForChecklistRanking(_fields)
    setFieldsForChecklistTemplateRanking(_fields)
    setFieldsForAuditRanking(_fields)
    setFieldsForAuditTemplateRanking(_fields)
  }

  const $_setRankingParams = () => {
    const _params = {
      ...rankingParams,
      ...FilterValueForChecklistRanking
    }
    setRankingParams(_params)
  }

  // const $_setRankingTabs = () => {
  //   const _tabItem = [
  //     {
  //       value: 'CheckListDaily',
  //       label: t('每日'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('點檢不合規題目'),
  //         frequency: 'day',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListWeekly',
  //       label: t('每週'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('點檢不合規題目'),
  //         frequency: 'week',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListMonthly',
  //       label: t('每月'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('點檢不合規題目'),
  //         frequency: 'month',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListSeasonly',
  //       label: t('每季'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('點檢不合規題目'),
  //         frequency: 'season',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListYearly',
  //       label: t('每年'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('每年'),
  //         frequency: 'year',
  //         rankingParams: rankingParams
  //       }
  //     },
  //     {
  //       value: 'CheckListEveryTime',
  //       label: t('每次作業前'),
  //       view: ViewRankingList,
  //       props: {
  //         label: t('每次作業前'),
  //         frequency: 'everyTime',
  //         rankingParams: rankingParams
  //       }
  //     }
  //   ]
  //   setRankingTabs(_tabItem)
  // }

  const $_setRankingParamsForChecklistTemplate = () => {
    const _params = {
      ...rankingParamsForChecklistTemplate,
      ...FilterValueForChecklistTemplateRanking
    }
    setRankingParamsForChecklistTemplate(_params)
  }

  const $_setRankingTabsForChecklistTemplate = () => {
    const _tabItem = [
      {
        value: 'CheckListDaily',
        label: t('每日'),
        view: ViewRankingList,
        props: {
          label: t('點檢公版不合規題目'),
          frequency: 'day',
          rankingParams: rankingParamsForChecklistTemplate
        }
      },
      {
        value: 'CheckListWeekly',
        label: t('每週'),
        view: ViewRankingList,
        props: {
          label: t('點檢公版不合規題目'),
          frequency: 'week',
          rankingParams: rankingParamsForChecklistTemplate
        }
      },
      {
        value: 'CheckListMonthly',
        label: t('每月'),
        view: ViewRankingList,
        props: {
          label: t('點檢公版不合規題目'),
          frequency: 'month',
          rankingParams: rankingParamsForChecklistTemplate
        }
      },
      {
        value: 'CheckListSeasonly',
        label: t('每季'),
        view: ViewRankingList,
        props: {
          label: t('點檢公版不合規題目'),
          frequency: 'season',
          rankingParams: rankingParamsForChecklistTemplate
        }
      },
      {
        value: 'CheckListYearly',
        label: t('每年'),
        view: ViewRankingList,
        props: {
          label: t('每年'),
          frequency: 'year',
          rankingParams: rankingParamsForChecklistTemplate
        }
      },
      {
        value: 'CheckListEveryTime',
        label: t('每次作業前'),
        view: ViewRankingList,
        props: {
          label: t('每次作業前'),
          frequency: 'everyTime',
          rankingParams: rankingParamsForChecklistTemplate
        }
      }
    ]
    // setRankingTabsForChecklistTemplate(_tabItem)
  }

  const $_setRankingParamsForAuditRanking = () => {
    const _params = {
      ...rankingParamsForAuditRanking,
      ...FilterValueForAuditRanking
    }
    setRankingParamsForAuditRanking(_params)
  }

  // const $_setRankingTabsForAuditRanking = () => {
  //   const _tabItem = [
  //     {
  //       view: ViewRankingList,
  //       props: {
  //         label: t('稽核不合規題目'),
  //         rankingParams: rankingParamsForAuditRanking
  //       }
  //     }
  //   ]
  //   setRankingTabsForAuditRanking(_tabItem)
  // }

  const $_setRankingParamsForAuditTemplateRanking = () => {
    const _params = {
      ...rankingParamsForAuditTemplateRanking,
      ...FilterValueForAuditTemplateRanking
    }
    setRankingParamsForAuditTemplateRanking(_params)
  }

  const $_setRankingTabsForAuditTemplateRanking = () => {
    const _tabItem = [
      {
        view: ViewRankingList,
        props: {
          label: t('稽核公版不合規題目'),
          rankingParams: rankingParamsForAuditTemplateRanking
        }
      }
    ]
    setRankingTabsForAuditTemplateRanking(_tabItem)
  }

  const $_getFields = () => {
    const _fields = {}
    systemClasses.forEach((systemClass, systemClassIndex) => {
      _fields[systemClass.id] = {
        label: t(systemClass.name),
        source: systemClass
      }
    })
    _fields.all = {
      label: t('全部'),
      color: $color.primary
    }
    setSystemClassesFields(_fields)
  }

  const $_getAlertFields = (defaultColor = $color.danger) => {
    const _fields = {}
    systemClasses.forEach((systemClass, systemClassIndex) => {
      _fields[systemClass.id] = {
        label: t(systemClass.name),
        source: systemClass
      }
    })
    _fields.all = {
      label: t('全部'),
      color: defaultColor
    }
    setSystemClassesAlertFields(_fields)
  }

  // Services For Chart
  const $_setValue = (models, countKey, startTime, endTime) => {
    const _value = S_SystemClassAnalysis.getFormattedValue(
      models,
      countKey,
      startTime,
      endTime
    )
    return _value
  }

  // Services For EVENT TYPES
  const $_fetchEventTypes = async () => {
    const _params = {
      order_by: 'sequence',
      order_way: 'asc',
    }
    const res = await S_EventType.index({ params: _params })
    const modifiedData = res.data.map(item => {
      return {
        ...item,
        value: item.id,
        label: item.name,
      };
    });
    setEventTypes(modifiedData)
  }

  const handleScroll = (event) => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  };

  React.useEffect(() => {
    if (isFocused) {
      $_setFactoryDropdown()
    }
  }, [])

  React.useEffect(() => {
    if (routeName === 'DashboardFactory') {
      $_fetchCardsInit()
      $_fetchEventTypes()
    }
  }, [currentFactory, currentConnectionState, currentIdleCounter])

  React.useEffect(() => {
    if (systemClasses) {
      $_getFields()
      $_getAlertFields()
      $_setPickItems()
    }
  }, [systemClasses, currentFactory, currentConnectionState])

  React.useEffect(() => {
    if (FilterValueForChecklistRanking) {
      $_setRankingParams()
    }
  }, [FilterValueForChecklistRanking, currentConnectionState])

  React.useEffect(() => {
    if (rankingParams) {
      // $_setRankingTabs()
    }
  }, [rankingParams, currentConnectionState])

  React.useEffect(() => {
    if (FilterValueForChecklistTemplateRanking) {
      $_setRankingParamsForChecklistTemplate()
    }
  }, [FilterValueForChecklistTemplateRanking, currentConnectionState])

  React.useEffect(() => {
    if (rankingParamsForChecklistTemplate) {
      $_setRankingTabsForChecklistTemplate()
    }
  }, [rankingParamsForChecklistTemplate, currentConnectionState])

  React.useEffect(() => {
    if (FilterValueForAuditRanking) {
      $_setRankingParamsForAuditRanking()
    }
  }, [FilterValueForAuditRanking, currentConnectionState])

  React.useEffect(() => {
    if (rankingParamsForAuditRanking) {
      // $_setRankingTabsForAuditRanking()
    }
  }, [rankingParamsForAuditRanking, currentConnectionState])

  React.useEffect(() => {
    if (FilterValueForAuditTemplateRanking) {
      $_setRankingParamsForAuditTemplateRanking()
    }
  }, [FilterValueForAuditTemplateRanking, currentConnectionState])

  React.useEffect(() => {
    if (rankingParamsForAuditTemplateRanking) {
      $_setRankingTabsForAuditTemplateRanking()
    }
  }, [rankingParamsForAuditTemplateRanking, currentConnectionState])

  const fetchData = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      $_fetchCardsInit();
      $_getFields();
      $_getAlertFields();
      $_setPickItems();
      setRefreshing(false);
    }, 0);
  }, [currentFactory]);

  // Render
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: $color.primary11l
      }}
    >
      <ScrollView
        testID={'ScrollView'}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
      >
        {loading ? (
          <>
            <WsPaddingContainer
              style={{
                paddingTop: 0
              }}>
              <WsSkeleton />
            </WsPaddingContainer>
          </>
        ) : (
          <>
            {currentViewMode == 'organization' && (
              <WsPaddingContainer
                style={{
                  paddingTop: 16,
                  paddingBottom: 0
                }}>
                <TouchableOpacity
                  style={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderColor: $color.white5d,
                    borderRadius: 15,
                    borderWidth: 1
                  }}
                  onPress={() => {
                    setPopupActive(true)
                  }}>
                  {sortValue && sortValue.name && (
                    <WsText size={18} style={{ paddingHorizontal: 16 }}>{sortValue.name}</WsText>
                  )}
                </TouchableOpacity>

                <WsPopup
                  active={popupActive}
                  onClose={() => {
                    setPopupActive(false)
                  }}>
                  {factoryFilter && (
                    <View
                      style={{
                        padding: 16,
                        width: width * 0.9,
                        backgroundColor: $color.white,
                        borderRadius: 10,
                      }}>
                      <ScrollView>
                        <LlLvInfoMultiLayer
                          items={factoryFilter}
                          value={sortValue}
                          onChange={$_selectFactories}
                        ></LlLvInfoMultiLayer>
                      </ScrollView>
                    </View>
                  )}
                </WsPopup>
              </WsPaddingContainer>
            )}

            <FlatList
              numColumns={2}
              style={{
                padding: 10,
                width: '100%'
              }}
              data={topAnalyzeData}
              keyExtractor={item => item.title}
              renderItem={({ item, index }) => (
                <WsAnalyzeCard
                  // disabled={item.count ? false : true}
                  key={index}
                  icon={item.icon}
                  title={item.title ? item.title : ''}
                  count={item.count}
                  isAlert={item.isAlert}
                  isPercent={item.isPercent}
                  onPress={() => {
                    if (!item.navigateScreen) {
                      return
                    }
                    navigation.push(item.navigateRoutesName, {
                      screen: item.navigateScreen,
                      params: {
                        item: item,
                        unit: sortValue
                      }
                    })
                  }}
                  upperRightOnPress={() => {
                    if (!item.upperRightNavigate) {
                      return
                    }
                    // issue-250526
                    if (item.upperRightNavigateScreen === 'AlertIndex') {
                      navigation.navigate(item.upperRightNavigate, {
                        tabIndex: 1
                      })
                    } else {
                      navigation.push(item.upperRightNavigate, {
                        screen: item.upperRightNavigateScreen
                      })
                    }
                  }}
                  style={{
                    margin: 4,
                    width: windowWidth * 0.45
                  }}
                />
              )}
            />
          </>
        )}
        <>
          {/* <WsPaddingContainer
            style={{
              borderRadius: 10,
              backgroundColor: $color.white,
              marginHorizontal: 16,
              marginBottom: 16,
            }}>
            <WsDashboardSearchCard
              tabItems={rankingTabs}
              tabIndex={rankingTabIndex}
              setTabIndex={setRankingTabIndex}
              title={t('點檢不合規排行榜')}
              fields={fieldsForChecklistRanking}
              onChange={$event => {
                let _params = $event
                if ($event.time_period && $event.time_period == '3months') {
                  _params.start_time = moment().subtract(3, 'months').format('YYYY-MM-DD');
                } else if ($event.time_period && $event.time_period == '1year') {
                  _params.start_time = moment().add(-1, 'year').format('YYYY-MM-DD')
                }
                setFilterValueForChecklistRanking(_params)
              }}
              rankingParams={rankingParams}
            />
          </WsPaddingContainer> */}

          {/* {currentViewMode == 'factory' && (
            <WsPaddingContainer
              style={{
                borderRadius: 10,
                backgroundColor: $color.white,
                marginHorizontal: 16,
                marginBottom: 16,
              }}>
              <WsDashboardSearchCard
                tabItems={rankingTabsForChecklistTemplate}
                tabIndex={rankingTabIndexForChecklistTemplate}
                setTabIndex={setRankingTabIndexForChecklistTemplate}
                title={t('點檢公版不合規排行榜')}
                fields={fieldsForChecklistTemplateRanking}
                onChange={($event) => {
                  let _params = $event
                  if ($event.time_period && $event.time_period == '3months') {
                    _params.start_time = moment().subtract(3, 'months').format('YYYY-MM-DD');
                  } else if ($event.time_period && $event.time_period == '1year') {
                    _params.start_time = moment().add(-1, 'year').format('YYYY-MM-DD')
                  }
                  setFilterValueForChecklistTemplateRanking(_params)
                }}
                rankingParams={rankingParamsForChecklistTemplate}
              />
            </WsPaddingContainer>
          )} */}

          {/* <WsPaddingContainer
            style={{
              borderRadius: 10,
              backgroundColor: $color.white,
              marginHorizontal: 16,
              marginBottom: 16
            }}>
            <WsDashboardSearchCard
              tabItems={rankingTabsForAuditRanking}
              tabIndex={rankingTabIndexForAuditRanking}
              setTabIndex={setRankingTabIndexForAuditRanking}
              title={t('稽核不合規排行榜')}
              fields={fieldsForAuditRanking}
              onChange={($event) => {
                let _params = $event
                if ($event.time_period && $event.time_period == '3months') {
                  _params.start_time = moment().subtract(3, 'months').format('YYYY-MM-DD');
                } else if ($event.time_period && $event.time_period == '1year') {
                  _params.start_time = moment().add(-1, 'year').format('YYYY-MM-DD')
                }
                setFilterValueForAuditRanking(_params)
              }}
              rankingParams={rankingParamsForAuditRanking}
            />
          </WsPaddingContainer> */}

          {/* {currentViewMode == 'factory' && (
            <WsPaddingContainer
              style={{
                borderRadius: 10,
                backgroundColor: $color.white,
                marginHorizontal: 16
              }}>
              <WsDashboardSearchCard
                tabItems={rankingTabsForAuditTemplateRanking}
                tabIndex={rankingTabIndexForAuditTemplateRanking}
                setTabIndex={setRankingTabIndexForAuditTemplateRanking}
                title={t('稽核公版不合規排行榜')}
                fields={fieldsForAuditTemplateRanking}
                onChange={($event) => {
                  let _params = $event
                  if ($event.time_period && $event.time_period == '3months') {
                    _params.start_time = moment().subtract(3, 'months').format('YYYY-MM-DD');
                  } else if ($event.time_period && $event.time_period == '1year') {
                    _params.start_time = moment().add(-1, 'year').format('YYYY-MM-DD')
                  }
                  setFilterValueForAuditTemplateRanking(_params)
                }}
                rankingParams={rankingParamsForAuditTemplateRanking}
              />
            </WsPaddingContainer>
          )} */}
        </>
        <WsPaddingContainer
          style={{
            paddingTop: 16
          }}>
          <WsChartsModels
            pickerValue={pickerValueForAlert}
            setPickerValue={$event => {
              setPickerValueForAlert($event)
              let _params = {
                ...alertParams
              }
              const _all = systemClasses.map(_ => _.id).toString()
              if ($event === _all || $event === undefined) {
                _params.system_class = 'all'
              } else {
                _params.system_class = $event
              }
              setAlertParams(_params)
            }}
            pickerItems={pickerItemsForAlert}
            pickerLabel001={t('領域')}
            label={t('警示')}
            yAxisTitle={t("數量")}
            placeholder={t('全部')}
            service={S_AlertMonth}
            headerRightIcon="ws-outline-arrow-go"
            itemType="date-half-year"
            type="stacked-bar-chart"
            tabItems={alertTabItems}
            fields={systemClassesAlertFields}
            params={alertParams}
            headerRightOnPress={() => {
              // issue-250526
              navigation.navigate('RoutesAlert', {
                defaultTabIndex: 1
              })
            }}
            startColor={$color.danger}
            endColor={$color.danger}
            setValueFromModels={$_setValue}
            timeField="created_at"
            onTabChange={$event => {
              if ($event == 0) {
                $_getAlertFields($color.danger)
                setAlertParams({
                  ...alertParams,
                  level: 2
                })
              } else {
                $_getAlertFields('#e8b400')
                setAlertParams({
                  ...alertParams,
                  level: 1
                })
              }
            }}
            countKey="alert_count"
          />
          <WsChartsModels
            pickerValue={pickerValueForEvent}
            setPickerValue={$event => {
              setPickerValueForEvent($event)
              let _params = {
                ...eventParams
              }
              const _all = systemClasses.map(_ => _.id).toString()
              if ($event === _all || $event === undefined) {
                _params.system_class = 'all'
              } else {
                _params.system_class = $event
              }
              setEventParams(_params)
            }}
            pickerValue002={pickerValue002ForEvent}
            setPickerValue002={$event => {
              setPickerValue002ForEvent($event)
              let _params = {
                ...eventParams,
                event_type: $event
              }
              setEventParams(_params)
            }}
            pickerItems={pickerItemsForEvent}
            placeholder={t('全部')}
            pickerItems002={eventTypes}
            placeholder002={t('全部')}
            label={t('風險事件')}
            pickerLabel002={t('類型')}
            pickerLabel001={t('領域')}
            yAxisTitle={t("數量")}
            countKey="event_count"
            service={S_EventMonth}
            startColor={$color.primary}
            endColor={$color.primary}
            headerRightIcon="ws-outline-arrow-go"
            itemType="date-half-year"
            type="stacked-bar-chart"
            headerRightOnPress={() => {
              navigation.navigate('RoutesEvent', {
                screen: 'EventIndex'
              })
            }}
            fields={systemClassesFields}
            setValueFromModels={$_setValue}
            timeField="created_at"
            params={eventParams}
            onTabChange={$event => {
              let event_type = $event + 1
              if ($event === 0) {
                event_type = 'all'
              }
              setEventParams({
                ...eventParams,
                event_type: event_type
              })
            }}
            style={{ marginTop: 16 }}
          />
          <WsChartsModels
            pickerValue={pickerValueForTask}
            setPickerValue={$event => {
              setPickerValueForTask($event)
              let _params = {
                ...taskParams,
                system_class: $event
              }
              const _all = systemClasses.map(_ => _.id).toString()
              if ($event === _all || $event === undefined) {
                _params.system_class = 'all'
              }
              setTaskParams(_params)
            }}
            pickerItems={pickerItemsForTask}
            pickerLabel001={t('領域')}
            placeholder={t('全部')}
            label={t('任務')}
            yAxisTitle={t("數量")}
            service={S_TaskMonth}
            params={taskParams}
            startColor={$color.primary}
            endColor={$color.primary}
            headerRightIcon="ws-outline-arrow-go"
            itemType="date-half-year"
            type="stacked-bar-chart"
            fields={systemClassesFields}
            setValueFromModels={$_setValue}
            headerRightOnPress={() => {
              navigation.navigate('RoutesTask', {
                screen: 'TaskIndex'
              })
            }}
            timeField="created_at"
            style={{ marginTop: 16 }}
            countKey="task_count"
          />
          <WsChartsModels
            pickerValue={pickerValueForContractorEnter}
            setPickerValue={$event => {
              setPickerValueForContractorEnter($event)
              let _params = {
                ...contractorEnterParams,
                system_class: $event
              }
              const _all = systemClasses.map(_ => _.id).toString()
              if ($event === _all || $event === undefined) {
                _params.system_class = 'all'
              }
              setContractorEnterParams(_params)
            }}
            pickerItems={pickerItemsForContractorEnter}
            pickerLabel001={t('領域')}
            placeholder={t('全部')}
            label={t('進場')}
            yAxisTitle={t("數量")}
            service={S_ContractorEnterRecordMonth}
            params={contractorEnterParams}
            startColor={$color.primary}
            endColor={$color.primary}
            headerRightIcon="ws-outline-arrow-go"
            itemType="date-half-year"
            headerRightOnPress={() => {
              navigation.navigate('RoutesContractorEnter', {
                screen: 'ContractorEnter'
              })
            }}
            type="stacked-bar-chart"
            fields={systemClassesFields}
            setValueFromModels={$_setValue}
            timeField="created_at"
            style={{ marginTop: 16 }}
            countKey="contractor_enter_record_count"
          />
        </WsPaddingContainer>
      </ScrollView>
    </SafeAreaView>
  )
}
export default Dashboard
