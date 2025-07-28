import React from 'react'
import {
  WsFlex,
  WsInfiniteScroll,
  LlAlertHeaderNumCard,
  LlAlertCard001,
  WsDialog,
  WsFilter,
  LlBtn002
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import config from '@/__config'
import { useSelector } from 'react-redux'
import S_Processor from '@/services/app/processor'
import { useNavigation } from '@react-navigation/native'

const AlertSolved = props => {
  const navigation = useNavigation()

  // Props
  const {
    // navigation, 
    setSolvedNum,
    noneSolveNum,
    solvedNum,
    numLoadingForSolved,
    setNumLoadingForSolved
  } = props.route.props

  // States
  const [modalVisible, setModalVisible] = React.useState(false)
  const [alertTypes, setAlertTypes] = React.useState([
    { name: '事件', value: 'event', id: 'event' },
    { name: '稽核', value: 'audit_record', id: 'audit_record' },
    { name: '點檢', value: 'checklist_record', id: 'checklist_record' },
    { name: '證照', value: 'license', id: 'license' },
    { name: '承攬商', value: 'contractor_license', id: 'contractor_license' },
    { name: '進場', value: 'contractor_enter_record', id: 'contractor_enter_record' },
  ])

  const [params, setParams] = React.useState({
    solved_at: 'not_null',
    order_by: 'created_at',
    order_way: 'desc'
  })
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: i18next.t('發布日期'),
      time_field: 'created_at'
    },
    from: {
      type: 'checkbox',
      label: i18next.t('項目'),
      items: alertTypes ? alertTypes : null
    },
  })
  const [filtersValue, setFiltersValue] = React.useState({
    button: {
      range: 'nolimit'
    },
    from: [
      "event",
      "task",
      "audit_record",
      "checklist_record",
      "license",
      "contractor_license",
      "contractor_enter_record",
      "exit_checklist"
    ]
  })
  const [popUpVisible, setPopUpVisible] = React.useState(false)
  const dialogButton = [
    {
      label: i18next.t('知道了'),
      onPress: () => {
        setPopUpVisible(false)
      }
    }
  ]

  // Services
  const $_fetchAlert = async () => {
    setNumLoadingForSolved(true)
    try {
      const res = await S_Alert.index({
        params: {
          ...params,
          solved_at: 'not_null'
        }
      })
      const _early = await S_Alert.index({
        params: {
          ...params,
          level: 1,
          solved_at: 'not_null'
        }
      })
      const _alertNum = await S_Alert.index({
        params: {
          ...params,
          level: 2,
          solved_at: 'not_null'
        }
      })
      setNumLoadingForSolved(false)
    } catch (err) {
      setSolvedNum(0)
    }
  }

  // Function
  const $_setParams = () => {
    const _filtersValue = S_Processor.getFormattedFiltersValue(
      filterFields,
      filtersValue
    )
    let _params = {
      ...params,
      ..._filtersValue,
      from: _filtersValue.from
        ? _filtersValue.from.toString()
        : null
    }
    setParams(_params)
  }

  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  React.useEffect(() => {
    $_fetchAlert()
  }, [])

  React.useEffect(() => {
    $_setParams()
  }, [filtersValue])

  React.useEffect(() => {
    $_fetchAlert()
  }, [params])

  return (
    <>
      <WsDialog
        dialogVisible={popUpVisible}
        setDialogVisible={setPopUpVisible}
        title={i18next.t('請使用網頁版查看詳細內容')}
        dialogButtonItems={dialogButton}
      />

      <WsFilter
        visible={modalVisible}
        setModalVisible={setModalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        filterTypeName={i18next.t('篩選條件')}
        fields={filterFields}
        currentValue={filtersValue}
        onSubmit={$_onFilterSubmit}
      />

      <WsInfiniteScroll
        service={S_Alert}
        padding={0}
        params={params}
        ListHeaderComponent={() => {
          return (
            <>
              <WsFlex
                style={{
                  paddingTop: 8,
                  paddingHorizontal: 16
                }}>
                <LlBtn002
                  style={{
                    width: 92,
                    height: 40
                  }}
                  onPress={() => setModalVisible(true)}>
                  {i18next.t('篩選條件')}
              </LlBtn002>
            </WsFlex>
            </>
          )
        }}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlAlertCard001
                style={[
                  index == 0
                    ? {
                      marginTop: 16
                    }
                    : {
                      marginTop: 8
                    }
                ]}
                alert={item}
                onPress={() => {
                  navigation.navigate({
                    name: 'AlertShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default React.memo(AlertSolved)
