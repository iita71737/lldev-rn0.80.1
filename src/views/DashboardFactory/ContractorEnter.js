import React from 'react'
import { WsTabView } from '@/components'
import TabViewDashboardContractorEnterList from '@/sections/Dashboard/ContractorEnterList'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import S_SystemClassAnalysis from '@/services/api/v1/systemclass_analysis'
import moment from 'moment'
import H_time from '@/helpers/time';
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'

const DashBoardContractorEnter = ({ navigation, route }) => {
  // Params
  const { item } = route.params

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentTimezone = useSelector(state => state.data.currentTimezone)

  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'todayNotReturn',
      label: i18next.t('今日未復歸'),
      view: TabViewDashboardContractorEnterList,
      props: {
        type: 1
      },
      tabNum: '...'
    },
    {
      value: 'TotalNotReturn',
      label: i18next.t('昨日未復歸'),
      view: TabViewDashboardContractorEnterList,
      props: {
        type: 2
      },
      tabNum: '...'
    }
  ])

  const $_fetchAnalysis = async () => {
    const { start: start_time, end: end_time } = H_time.getFactoryDayStartEndTime(currentTimezone);
    const _params = {
      factory: currentFactory.id,
      // start_time: start_time,
      // end_time: end_time,
      // time_field: 'created_at',
      // order_by: 'created_at',
      // order_way: 'desc'
    }
    console.log(_params, '$_fetchAnalysis _params');
    const res = await S_ContractorEnterRecord.getNonReturnCurrentIndex({ params: _params })
    const res2 = await S_ContractorEnterRecord.getNonReturnYesterdayIndex({ params: _params })
    setTabItems([
      {
        value: 'todayNotReturn',
        label: i18next.t('今日未復歸'),
        view: TabViewDashboardContractorEnterList,
        props: {
          type: 1,
          tabNum: res.meta && res.meta.total ? res.meta.total : 0
        },
        tabNum: res.meta && res.meta.total ? res.meta.total : 0
      },
      {
        value: 'TotalNotReturn',
        label: i18next.t('昨日未復歸'),
        view: TabViewDashboardContractorEnterList,
        props: {
          type: 2,
          tabNum: res2.meta && res2.meta.total ? res2.meta.total : 0
        },
        tabNum: res2.meta && res2.meta.total ? res2.meta.total : 0
      }
    ])
  }

  React.useEffect(() => {
    $_fetchAnalysis()
  }, [])

  return (
    <>
      <WsTabView
        index={tabIndex}
        isAutoWidth={true}
        textSize={14}
        setIndex={settabIndex}
        items={tabItems}
      />
    </>
  )
}

export default DashBoardContractorEnter
