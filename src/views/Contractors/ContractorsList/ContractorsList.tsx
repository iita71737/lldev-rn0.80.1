import React, { useState } from 'react'
import {
  WsPage,
  WsTabView
} from '@/components'
import i18next from 'i18next'
import Cooperate from '@/sections/Contractors/Cooperate'
import InCorporate from '@/sections/Contractors/InCorporate'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_Contractor from '@/services/api/v1/contractor'

const ContractorsList = (props) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // redux
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Props
  const {
  } = props

  // States
  const [loading, setLoading] = React.useState<boolean>(true);
  const [cooperateCount, setCooperateCount] = React.useState()
  const [inCorporateCount, setInCorporateCount] = React.useState()
  const [tabParams, setTabParams] = React.useState<any>({
    order_way: "desc",
    order_by: "created_at",
    time_field: 'created_at'
  })

  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState()
  const [filterValue, setFilterValue] = useState<any>();
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: i18next.t('最後進場日期')
    },
    contractor_types: {
      type: 'checkbox',
      label: i18next.t('承攬類別'),
      storeKey: "contractorTypes",
    },
    contractor_customed_types: {
      type: 'checkbox',
      label: i18next.t('自訂類別'),
      storeKey: "contractorCustomTypes",
    },
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })

  // Function
  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'Cooperate',
        label: i18next.t('合作中'),
        view: Cooperate,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          onParamsChange: $_onParamsChange
        },
        tabNum: cooperateCount ? cooperateCount : '0'
      },
      {
        value: 'InCorporate',
        label: i18next.t('合作終止'),
        view: InCorporate,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          onParamsChange: $_onParamsChange
        },
        tabNum: inCorporateCount ? inCorporateCount : '0'
      }
    ])
  }

  const $_setTabNum = async (_params: any = {}) => {
    // console.log(_params, '_params contractor');
    delete _params.contractor_status
    try {
      const res = await S_Contractor.tabIndex({
        params: _params
      })
      await Promise.all([res])
        .then(res => {
          // console.log(res, 'res');
          setCooperateCount(res[0].data.status_1_count.toString())
          setInCorporateCount(res[0].data.status_0_count.toString())
          setLoading(false)
        })
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }

  const $_onParamsChange = (params: any, filtersValue: any) => {
    let _allParams = {
      ...tabParams,
      ...params,
    }
    if (filterValue && !filtersValue.search) {
      delete _allParams.search
    }
    setTabParams(_allParams)
    setFilterValue(filtersValue)
    $_setTabNum(_allParams)
  }

  React.useEffect(() => {
    $_setTabItems()
  }, [cooperateCount, inCorporateCount, filterValue, systemClasses])

  React.useEffect(() => {
    if (tabItems) {
      $_setTabNum(tabParams)
    }
  }, [tabItems, filterValue])

  // 切廠更新
  React.useEffect(() => {
    $_setTabNum(tabParams)
  }, [currentFactory])

  return (
    <>
      {tabItems && !loading && (
        <WsTabView
          items={tabItems}
          scrollEnabled={false}
          isAutoWidth={true}
          index={tabIndex}
          setIndex={settabIndex}
        />
      )}
    </>
  )
}
export default ContractorsList
