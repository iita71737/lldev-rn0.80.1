// import React, { useState } from 'react'
// import {
//   View,
//   FlatList,
//   TextInput,
//   ScrollView,
//   StatusBar,
//   Dimensions,
//   TouchableOpacity
// } from 'react-native'
// import {
//   WsAnalyzeCard,
//   WsBtn,
//   WsText,
//   WsFlex,
//   WsStatePicker,
//   WsState,
//   WsGrid,
//   WsPaddingContainer,
//   WsCharts,
//   WsChartsModels,
//   WsSkeleton,
//   WsDashboardSearchCard,
//   WsLoadingImageSwitch,
//   WsLoading,
//   WsPopup,
//   LlLvInfoMultiLayer
// } from '@/components'
// import store from '@/store'
// import { useSelector } from 'react-redux'
// import { setDataFail } from '@/store/data'
// import $color from '@/__reactnative_stone/global/color'
// import S_TaskMonth from '@/services/api/v1/task_month'
// import S_AlertMonth from '@/services/api/v1/alert_month'
// import S_EventMonth from '@/services/api/v1/event_month'
// import S_FactoryTotalAnalysis from '@/services/api/v1/factory_total'
// import S_SystemClassAnalysis from '@/services/api/v1/systemclass_analysis'
// import S_ContactorEnterRecordMonth from '@/services/api/v1/contractor_enter_record_month'
// import moment from 'moment'
// import { useTranslation } from 'react-i18next'
// import layouts from '@/__reactnative_stone/global/layout'
// import ViewRankingList from '@/sections/Dashboard/RankingList'
// import { useFocusEffect } from '@react-navigation/native'
// import { useIsFocused } from '@react-navigation/native'
// import S_EventType from '@/services/api/v1/event_type'
// import S_Factory from '@/services/api/v1/factory'
// import H_factory from "@/helpers/factory"

// const FactoryDashboardShow = ({ navigation }) => {
//   const { width, height } = Dimensions.get('window')
//   const { windowWidth, windowHeight } = layouts
//   const { t, i18n } = useTranslation()
//   const currentLang = i18n.language
//   const isFocused = useIsFocused()

//   // Redux
//   const systemClasses = useSelector(state => state.data.systemClasses)
//   const currentFactory = useSelector(state => state.data.currentFactory)
//   const currentOrganization = useSelector(
//     state => state.data.currentOrganization
//   )
//   const currentUser = useSelector(state => state.data.currentUser)

//   // State
//   const [popupActive, setPopupActive] = React.useState(false)
//   const [sortValue, setSortValue] = React.useState(currentFactory)
//   const [factoryFilter, setFactoryFilter] = React.useState()

//   const [loading, setLoading] = React.useState(true)
//   const [systemClassesFields, setSystemClassesFields] = React.useState()
//   const [systemClassesAlertFields, setSystemClassesAlertFields] = React.useState()
//   const [topAnalyzeData, setTopAnalyzeData] = React.useState([])

//   // ALERT CHART STATES
//   const [alertTabItems, setAlertTabItems] = React.useState([
//     {
//       value: 'alert',
//       label: t('警示')
//     },
//     {
//       value: 'remind',
//       // label: t('提醒') // no use
//     }
//   ])
//   const [alertParams, setAlertParams] = React.useState({ level: 1 })
//   const [pickerItemsForAlert, setPickItemsForAlert] = React.useState([
//     { label: t('example1'), value: null },
//     { label: t('example2'), value: 16 }
//   ])
//   const [pickerValueForAlert, setPickerValueForAlert] = React.useState()

//   // EVENT CHART STATES
//   const [eventTabItems, setEventTabItems] = React.useState([
//     {
//       value: 'attention',
//       label: t('意外事故')
//     },
//     {
//       value: 'outside',
//       label: t('外部稽查') // 要改成來自後台
//     },
//     {
//       value: 'ticket',
//       label: t('罰單')
//     },
//     {
//       value: 'error',
//       label: t('操作異常')
//     },
//     {
//       value: 'other',
//       label: t('其他')
//     }
//   ])
//   const [eventParams, setEventParams] = React.useState({ event_type: 2 })
//   const [eventTypes, setEventTypes] = React.useState([
//     { label: t('全部'), value: 'all' },
//   ])
//   const [pickerValue002ForEvent, setPickerValue002ForEvent] = React.useState()
//   const [pickerItemsForEvent, setPickItemsForEvent] = React.useState([
//     { label: t('example1'), value: null },
//     { label: t('example2'), value: 16 }
//   ])
//   const [pickerValueForEvent, setPickerValueForEvent] = React.useState()

//   // PICKER_INIT
//   const $_setFactoryDropdown = async () => {
//     try {
//       const params = {
//         organization: currentOrganization ? currentOrganization.id : currentFactory.id
//       }
//       const res = await S_Factory.index({ params })
//       // const items = H_factory.getOrganizationFactoryScopeList(res.data);
//       setFactoryFilter(res.data)
//       setSortValue(res.data[0])
//     } catch (err) {
//       alert(err);
//     }
//   }

//   // Task Chart States
//   const [taskParams, setTaskParams] = React.useState({
//     system_class: 'all'
//   })
//   const [pickerItemsForTask, setPickItemsForTask] = React.useState([
//     { label: t('example1'), value: null },
//     { label: t('example2'), value: 16 }
//   ])
//   const [pickerValueForTask, setPickerValueForTask] = React.useState()

//   // ContractorEnter Chart State
//   const [contractorEnterParams, setContractorEnterParams] = React.useState()
//   const [pickerItemsForContractorEnter, setPickItemsForContractorEnter] =
//     React.useState([
//       { label: t('example1'), value: null },
//       { label: t('example2'), value: 16 }
//     ])
//   const [pickerValueForContractorEnter, setPickerValueForContractorEnter] =
//     React.useState()

//   // Checklist Ranking States
//   const [rankingTabs, setRankingTabs] = React.useState()
//   const [rankingTabIndex, setRankingTabIndex] = React.useState(0)
//   const [rankingParams, setRankingParams] = React.useState({
//     page: 1,
//     system_classes: '4,5,6,7,10',
//     type: 'checklist',
//     start_time: moment().add(-1, 'year').format('YYYY-MM-DD'),
//     end_time: moment().format('YYYY-MM-DD')
//   })
//   const [FilterValueForChecklistRanking, setFilterValueForChecklistRanking] =
//     React.useState()
//   const [fieldsForChecklistRanking, setFieldsForChecklistRanking] =
//     React.useState({
//       system_classes: {
//         type: 'picker',
//         items: [{ label: t('全部'), value: '4,5,6,7,10' }]
//       },
//       time_period: {
//         type: 'picker',
//         items: [
//           {
//             label: t('近一年'),
//             value: 1
//           },
//           { label: t('否'), value: 0 }
//         ]
//       }
//     })

//   // Audit Ranking States
//   // const [rankingTabsForAuditRanking, setRankingTabsForAuditRanking] =
//   //   React.useState([
//   //     {
//   //       view: ViewRankingList,
//   //       props: {
//   //         label: t('稽核不合規題目'),
//   //         rankingParams: rankingParamsForAuditRanking
//   //       }
//   //     }
//   //   ])
//   const [rankingTabIndexForAuditRanking, setRankingTabIndexForAuditRanking] =
//     React.useState(0)
//   const [rankingParamsForAuditRanking, setRankingParamsForAuditRanking] =
//     React.useState({
//       page: 1,
//       system_classes: '4,5,6,7,10',
//       type: 'audit',
//       start_time: moment().add(-1, 'year').format('YYYY-MM-DD'),
//       end_time: moment().format('YYYY-MM-DD')
//     })
//   const [FilterValueForAuditRanking, setFilterValueForAuditRanking] =
//     React.useState()
//   const [fieldsForAuditRanking, setFieldsForAuditRanking] = React.useState({
//     system_classes: {
//       type: 'picker',
//       items: [{ label: t('全部'), value: '4,5,6,7,10' }]
//     },
//     time_period: {
//       type: 'picker',
//       items: [
//         {
//           label: t('近一年'),
//           value: 1
//         },
//         { label: t('否'), value: 0 }
//       ]
//     }
//   })

//   // FUNC
//   const $_selectFactories = async (unit) => {
//     if (!unit) {
//       return
//     }
//     setLoading(true)
//     const totalRes = await S_FactoryTotalAnalysis.indexV2({
//       params: {
//         factory: unit.id,
//         organization: currentOrganization.id,
//         start_time: moment().format('YYYY-MM-DD'),
//         end_time: moment().format('YYYY-MM-DD'),
//         time_field: 'created_at'
//       }
//     })
//     if (totalRes) {
//       const _numberData = S_SystemClassAnalysis.setNumberCardData_v2(
//         totalRes.data
//       )
//       setTopAnalyzeData(_numberData)
//       setSortValue(unit)
//       setLoading(false)
//       setPopupActive(false)
//     }
//   }

//   // Services
//   const $_fetchCardsInit = async () => {
//     const _params = {
//       factory: currentFactory && currentFactory.id,
//       organization: currentOrganization.id,
//       start_time: moment().format('YYYY-MM-DD'),
//       end_time: moment().format('YYYY-MM-DD'),
//       time_field: 'created_at'
//     }
//     const totalRes = await S_FactoryTotalAnalysis.indexV2({ params: _params })
//     if (totalRes) {
//       const _numberData = S_SystemClassAnalysis.setNumberCardData_v2(
//         totalRes.data
//       )
//       setTopAnalyzeData(_numberData)
//       setLoading(false)
//     }
//   }

//   // Function Initial Dropdown Menu For BarChart
//   const $_setPickItems = () => {
//     const _systemClasses = JSON.parse(JSON.stringify(systemClasses))
//     const init = []
//     const PickItemArr = []
//     _systemClasses.forEach(systemClass => {
//       init.push(systemClass.id)
//       PickItemArr[0] = {
//         label: t('全部'),
//         value: init.toString()
//       }
//     })
//     _systemClasses.forEach(systemClass => {
//       PickItemArr.push({
//         label: systemClass.name,
//         value: systemClass.id
//       })
//     })
//     setPickItemsForAlert(PickItemArr)
//     setPickItemsForEvent(PickItemArr)
//     setPickItemsForTask(PickItemArr)
//     setPickItemsForContractorEnter(PickItemArr)
//     $_setChartFieldsForChecklistRanking(PickItemArr)
//   }
//   // Initial PickItems Fields 初始化篩選條件的欄位
//   const $_setChartFieldsForChecklistRanking = pickItems => {
//     const _fields = {
//       system_classes: {
//         type: 'picker',
//         items: pickItems,
//         defaultValue: pickItems[0]
//       },
//       time_period: {
//         type: 'picker',
//         items: [
//           {
//             label: t('近一年'),
//             value: 1
//           },
//           { label: t('自訂'), value: 'custom' }
//         ],
//         updateValueOnChange: value => {
//           if (value === 1) {
//             return {
//               start_time: moment().add(-1, 'year').format('YYYY-MM-DD'),
//               end_time: moment().format('YYYY-MM-DD')
//             }
//           } else {
//             return false
//           }
//         }
//       },
//       start_time: {
//         type: 'date',
//         label: t('開始日期'),
//         displayCheck(fieldsValue) {
//           if (fieldsValue.time_period == 'custom') {
//             return true
//           } else {
//             return false
//           }
//         }
//       },
//       end_time: {
//         type: 'date',
//         label: t('結束日期'),
//         displayCheck(fieldsValue) {
//           if (fieldsValue.time_period == 'custom') {
//             return true
//           } else {
//             return false
//           }
//         }
//       }
//     }
//     setFieldsForChecklistRanking(_fields)
//     setFieldsForAuditRanking(_fields)
//   }

//   const $_setRankingParams = () => {
//     const _params = {
//       ...rankingParams,
//       ...FilterValueForChecklistRanking
//     }
//     setRankingParams(_params)
//   }
//   // const $_setRankingTabs = () => {
//   //   const _tabItem = [
//   //     {
//   //       value: 'CheckListDaily',
//   //       label: t('每日'),
//   //       view: ViewRankingList,
//   //       props: {
//   //         label: t('點檢不合規題目'),
//   //         frequency: 'day',
//   //         rankingParams: rankingParams
//   //       }
//   //     },
//   //     {
//   //       value: 'CheckListWeekly',
//   //       label: t('每週'),
//   //       view: ViewRankingList,
//   //       props: {
//   //         label: t('點檢不合規題目'),
//   //         frequency: 'week',
//   //         rankingParams: rankingParams
//   //       }
//   //     },
//   //     {
//   //       value: 'CheckListMonthly',
//   //       label: t('每月'),
//   //       view: ViewRankingList,
//   //       props: {
//   //         label: t('點檢不合規題目'),
//   //         frequency: 'month',
//   //         rankingParams: rankingParams
//   //       }
//   //     },
//   //     {
//   //       value: 'CheckListSeasonly',
//   //       label: t('每季'),
//   //       view: ViewRankingList,
//   //       props: {
//   //         label: t('點檢不合規題目'),
//   //         frequency: 'season',
//   //         rankingParams: rankingParams
//   //       }
//   //     }
//   //   ]
//   //   setRankingTabs(_tabItem)
//   // }
//   const $_setRankingParamsForAuditRanking = () => {
//     const _params = {
//       ...rankingParamsForAuditRanking,
//       ...fieldsForAuditRanking
//     }
//     setRankingParamsForAuditRanking(_params)
//   }
//   // const $_setRankingTabsForAuditRanking = () => {
//   //   const _tabItem = [
//   //     {
//   //       view: ViewRankingList,
//   //       props: {
//   //         label: t('稽核不合規題目'),
//   //         rankingParams: rankingParamsForAuditRanking
//   //       }
//   //     }
//   //   ]
//   //   setRankingTabsForAuditRanking(_tabItem)
//   // }

//   const $_getFields = () => {
//     const _fields = {}
//     systemClasses.forEach((systemClass, systemClassIndex) => {
//       _fields[systemClass.id] = {
//         label: systemClass.name,
//         source: systemClass
//       }
//     })
//     setSystemClassesFields(_fields)
//   }

//   const $_getAlertFields = () => {
//     const _fields = {}
//     systemClasses.forEach((systemClass, systemClassIndex) => {
//       _fields[systemClass.id] = {
//         label: systemClass.name,
//         source: systemClass
//       }
//     })
//     setSystemClassesAlertFields(_fields)
//   }

//   // Services For Chart
//   const $_setValue = (models, countKey, startTime, endTime) => {
//     return S_SystemClassAnalysis.getFormattedValue(
//       models,
//       countKey,
//       startTime,
//       endTime
//     )
//   }

//   // Services For EVENT TYPES
//   const $_fetchEventTypes = async () => {
//     const _params = {
//       lang: currentLang
//     }
//     const res = await S_EventType.index({ params: _params })
//     // 230825_手動排序
//     const _sort = S_EventType.manualSort(res.data)
//     // 把欄位name替換成label
//     const modifiedData = _sort.map(item => {
//       return {
//         ...item,
//         value: item.id, // 將 id 屬性的值設置為 value 屬性的值
//         label: item.name, // 將 name 屬性的值設置為 label 屬性的值
//       };
//     });
//     setEventTypes([...eventTypes, ...modifiedData])
//   }

//   React.useEffect(() => {
//     $_fetchCardsInit()
//     $_fetchEventTypes()
//   }, [])

//   React.useEffect(() => {
//     if (isFocused) {
//       $_setFactoryDropdown()
//     }
//   }, [isFocused])

//   React.useEffect(() => {
//     if (systemClasses) {
//       $_getFields()
//       $_getAlertFields()
//       $_setPickItems()
//     }
//   }, [systemClasses])

//   React.useEffect(() => {
//     if (FilterValueForChecklistRanking) {
//       $_setRankingParams()
//     }
//   }, [FilterValueForChecklistRanking])

//   React.useEffect(() => {
//     if (rankingParams) {
//       // $_setRankingTabs()
//     }
//   }, [rankingParams])

//   React.useEffect(() => {
//     if (FilterValueForAuditRanking) {
//       $_setRankingParamsForAuditRanking()
//     }
//   }, [FilterValueForAuditRanking])

//   React.useEffect(() => {
//     if (rankingParamsForAuditRanking) {
//       // $_setRankingTabsForAuditRanking()
//     }
//   }, [rankingParamsForAuditRanking])

//   // Render
//   return (
//     <>
//       <StatusBar barStyle={'dark-content'} />
//       <ScrollView>
//         {loading ? (
//           <>
//             <WsPaddingContainer
//               style={{
//                 paddingTop: 0
//               }}>
//               <WsSkeleton />
//             </WsPaddingContainer>
//           </>
//         ) : (
//           <>
//             <WsPaddingContainer
//               style={{
//                 paddingTop: 16,
//                 paddingBottom: 0
//               }}>

//               <TouchableOpacity
//                 style={{
//                   paddingLeft: 0,
//                   paddingRight: 0,
//                   padding: 12,
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   borderColor: $color.white5d,
//                   borderRadius: 15,
//                   borderWidth: 1
//                 }}
//                 onPress={() => {
//                   setPopupActive(true)
//                 }}>
//                 {sortValue && sortValue.name && (
//                   <WsText size={18} style={{ paddingHorizontal: 16 }}>{sortValue.name}</WsText>
//                 )
//                 }
//               </TouchableOpacity>

//               <WsPopup
//                 active={popupActive}
//                 onClose={() => {
//                   setPopupActive(false)
//                 }}>
//                 {factoryFilter && (
//                   <View
//                     style={{
//                       width: width * 0.9,
//                       height: height * 0.4,
//                       backgroundColor: $color.white,
//                       borderRadius: 10,
//                     }}>
//                     <ScrollView>
//                       <LlLvInfoMultiLayer
//                         items={factoryFilter}
//                         value={sortValue}
//                         onChange={$_selectFactories}
//                       ></LlLvInfoMultiLayer>
//                     </ScrollView>
//                   </View>
//                 )}
//               </WsPopup>

//             </WsPaddingContainer>
//             <FlatList
//               keyExtractor={item => item.title}
//               data={topAnalyzeData}
//               numColumns={2}
//               style={{
//                 padding: 10,
//                 width: '100%'
//               }}
//               renderItem={({ item, index }) => (
//                 <WsAnalyzeCard
//                   key={index}
//                   icon={item.icon}
//                   title={item.title ? item.title : ''}
//                   count={item.count}
//                   isAlert={item.isAlert}
//                   isPercent={item.isPercent}
//                   onPress={() => {
//                     if (!item.navigate) {
//                       return
//                     }
//                     navigation.navigate({
//                       name: item.navigate,
//                       params: {
//                         item: item
//                       }
//                     })
//                   }}
//                   upperRightOnPress={() => {
//                     if (!item.upperRightNavigate) {
//                       return
//                     }
//                     navigation.navigate({
//                       name: item.upperRightNavigate
//                     })
//                   }}
//                   style={{
//                     margin: 4,
//                     width: windowWidth * 0.45
//                   }}
//                 />
//               )}
//             />
//           </>)}
//         <>
//           {/* <WsPaddingContainer
//             style={{
//               borderRadius: 10,
//               backgroundColor: $color.white,
//               marginHorizontal: 16,
//               marginBottom: 16
//             }}>
//             <WsDashboardSearchCard
//               tabItems={rankingTabs}
//               tabIndex={rankingTabIndex}
//               setTabIndex={setRankingTabIndex}
//               title={t('點檢不合規排行榜')}
//               fields={fieldsForChecklistRanking}
//               onChange={$event => { setFilterValueForChecklistRanking($event) }}
//             />
//           </WsPaddingContainer> */}
//           {/* <WsPaddingContainer
//             style={{
//               borderRadius: 10,
//               backgroundColor: $color.white,
//               marginHorizontal: 16,
//               marginBottom: 16
//             }}>
//             <WsDashboardSearchCard
//               tabItems={rankingTabsForAuditRanking}
//               tabIndex={rankingTabIndexForAuditRanking}
//               setTabIndex={setRankingTabIndexForAuditRanking}
//               title={t('稽核不合規排行榜')}
//               fields={fieldsForAuditRanking}
//               onChange={setFilterValueForAuditRanking}
//             />
//           </WsPaddingContainer> */}

//           <WsPaddingContainer
//             style={{
//               paddingTop: 0
//             }}>
//             <WsChartsModels
//               pickerValue={pickerValueForAlert}
//               setPickerValue={$event => {
//                 setPickerValueForAlert($event)
//                 let _params = {
//                   ...alertParams
//                 }
//                 if ($event === '4,7,6,5,10' || $event === undefined) {
//                   _params.system_class = 'all'
//                 } else {
//                   _params.system_class = $event
//                 }
//                 setAlertParams(_params)
//               }}
//               pickerItems={pickerItemsForAlert}
//               placeholder={t('全部')}
//               label={t('警示')}
//               yAxisTitle={t("數量")}
//               service={S_AlertMonth}
//               headerRightIcon="ws-outline-arrow-go"
//               itemType="date-half-year"
//               type="stacked-bar-chart"
//               tabItems={alertTabItems}
//               fields={systemClassesAlertFields}
//               params={alertParams}
//               headerRightOnPress={() => {
//                 navigation.navigate('RoutesAlert', {
//                   screen: 'AlertIndex'
//                 })
//               }}
//               startColor={$color.danger}
//               endColor={$color.danger11l}
//               setValueFromModels={$_setValue}
//               timeField="date"
//               onTabChange={$event => {
//                 if ($event == 0) {
//                   setAlertParams({ level: 2 })
//                 } else {
//                   setAlertParams({ level: 1 })
//                 }
//               }}
//               countKey="alert_count"
//             />
//             <WsChartsModels
//               pickerValue={pickerValueForEvent}
//               setPickerValue={$event => {
//                 setPickerValueForEvent($event)
//                 let _params = {
//                   ...eventParams
//                 }
//                 if ($event === '4,7,6,5,10' || $event === undefined) {
//                   _params.system_class = 'all'
//                 } else {
//                   _params.system_class = $event
//                 }
//                 setEventParams(_params)
//               }}
//               pickerValue002={pickerValue002ForEvent}
//               setPickerValue002={$event => {
//                 setPickerValue002ForEvent($event)
//                 let _params = {
//                   ...eventParams,
//                   event_type: $event
//                 }
//                 setEventParams(_params)
//               }}
//               pickerItems={pickerItemsForEvent}
//               placeholder={t('全部')}
//               pickerItems002={eventTypes}
//               placeholder002={t('全部')}
//               label={t('事件')}
//               yAxisTitle="數量"
//               countKey="event_count"
//               service={S_EventMonth}
//               headerRightIcon="ws-outline-arrow-go"
//               itemType="date-half-year"
//               type="stacked-bar-chart"
//               tabItems={eventTabItems}
//               headerRightOnPress={() => {
//                 navigation.navigate('RoutesEvent', {
//                   screen: 'EventIndex'
//                 })
//               }}
//               fields={systemClassesFields}
//               setValueFromModels={$_setValue}
//               timeField="date"
//               params={eventParams}
//               onTabChange={$event => {
//                 setEventParams({
//                   ...eventParams,
//                   event_type: $event + 1
//                 })
//               }}
//               style={{ marginTop: 16 }}
//             />
//             <WsChartsModels
//               pickerValue={pickerValueForTask}
//               setPickerValue={$event => {
//                 setPickerValueForTask($event)
//                 let _params = {
//                   ...taskParams,
//                   system_class: $event
//                 }
//                 if ($event === '4,7,6,5,10' || $event === undefined) {
//                   _params.system_class = 'all'
//                 }
//                 setTaskParams(_params)
//               }}
//               pickerItems={pickerItemsForTask}
//               placeholder={t('全部')}
//               label={t('任務')}
//               yAxisTitle="數量"
//               service={S_TaskMonth}
//               params={taskParams}
//               headerRightIcon="ws-outline-arrow-go"
//               itemType="date-half-year"
//               type="stacked-bar-chart"
//               fields={systemClassesFields}
//               setValueFromModels={$_setValue}
//               headerRightOnPress={() => {
//                 navigation.navigate('RoutesTask', {
//                   screen: 'TaskIndex'
//                 })
//               }}
//               timeField="date"
//               style={{ marginTop: 16 }}
//               countKey="task_count"
//             />
//             <WsChartsModels
//               pickerValue={pickerValueForContractorEnter}
//               setPickerValue={$event => {
//                 setPickerValueForContractorEnter($event)
//                 let _params = {
//                   ...contractorEnterParams,
//                   system_class: $event
//                 }
//                 if ($event === '4,7,6,5,10' || $event === undefined) {
//                   _params.system_class = 'all'
//                 }
//                 setContractorEnterParams(_params)
//               }}
//               pickerItems={pickerItemsForContractorEnter}
//               placeholder={t('全部')}
//               label={t('進場')}
//               yAxisTitle="數量"
//               service={S_ContactorEnterRecordMonth}
//               params={contractorEnterParams}
//               headerRightIcon="ws-outline-arrow-go"
//               itemType="date-half-year"
//               headerRightOnPress={() => {
//                 navigation.navigate('RoutesContractorEnter', {
//                   screen: 'ContractorEnter'
//                 })
//               }}
//               type="stacked-bar-chart"
//               fields={systemClassesFields}
//               setValueFromModels={$_setValue}
//               timeField="date"
//               style={{ marginTop: 16 }}
//               countKey="contractor_enter_record_count"
//             />
//           </WsPaddingContainer>
//         </>
//       </ScrollView>
//     </>
//   )
// }
// export default FactoryDashboardShow
