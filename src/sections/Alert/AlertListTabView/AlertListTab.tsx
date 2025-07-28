import React from 'react'
import {
  WsFlex,
  WsInfiniteScroll,
  LlAlertHeaderNumCard,
  LlAlertCard001,
  WsPopup,
  WsDialog,
  WsFilter,
  LlBtn002,
  WsPageIndex
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setRefetchChecker,
  setIdleCounter
} from '@/store/data'
import { useTranslation } from 'react-i18next'

const AlertListTab = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
    solved_at,
    _unSolvePercent,
    _solvePercent,
    onParamsChange,
    numLoading,
    alertNum,
    early,
    filterValue
  } = props.route.props

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const refetchChecker = useSelector(state => state.data.refetchChecker)

  // MEMO
  const params = React.useMemo(() => {
    if (refetchChecker.AlertListTab) {
      store.dispatch(setRefetchChecker({
        ...refetchChecker,
        AlertListTab: false
      }))
    }
    return {
      from: filterValue && filterValue.from ? filterValue.from.map(_item=> _item.id).toString() : undefined,
      solved_at: solved_at,
      order_by: 'created_at',
      order_way: 'desc',
      time_field: 'created_at'
    }
  }, [refetchChecker.AlertListTab, filterValue]);

  const [filterFields] = React.useState({
    from: {
      type: 'checkbox',
      label: t('項目'),
      items:
        [
          {
            id: "event",
            name: t("事件")
          },
          {
            id: "audit_record",
            name: t("稽核")
          },
          {
            id: "checklist_record",
            name: t("點檢")
          },
          {
            id: "license",
            name: t("證照"),
          },
          {
            id: "contractor_license",
            name: t("承攬商"),
          },
          {
            id: "contractor_enter_record",
            name: t("進場"),
          },
          {
            id: "exit_checklist",
            name: t("收工檢查"),
          },
        ]
    },
    button: {
      type: 'date_range',
      label: i18next.t('發布日期'),
      time_field: 'created_at'
    },
  })

  // DETECT IDLE
  const handleScroll = () => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  };


  // Render
  return (
    <>
      <WsPageIndex
        onScroll={handleScroll}
        modelName={'ll_alert'}
        serviceIndexKey={'index'}
        params={params}
        searchVisible={false}
        filterFields={filterFields}
        onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlAlertCard001
                testID={`LlAlertCard001-${index}`}
                style={[
                  index == 0
                    ? {
                      marginTop: 0
                    }
                    : {
                      marginTop: 8
                    }
                ]}
                alert={item}
                onPress={() => {
                  navigation.push('RoutesAlert', {
                    screen: 'AlertShow',
                    params: {
                      id: item.id,
                    }
                  })
                }}
              />
            </>
          )
        }}
        ListHeaderComponent={() => {
          return (
            <>
              <WsFlex
                style={{
                  padding: 8
                }}>
                <LlAlertHeaderNumCard
                  numLoading={numLoading}
                  iconColor={$color.danger}
                  icon="ws-filled-alert"
                  text={i18next.t('警示')}
                  num={alertNum}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    paddingTop: 8,
                    paddingBottom: 8
                  }}
                />
                <LlAlertHeaderNumCard
                  numLoading={numLoading}
                  iconColor={$color.yellow}
                  icon="ws-filled-alert"
                  text={i18next.t('預警')}
                  num={early}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    paddingTop: 8,
                    paddingBottom: 8
                  }}
                />
                <LlAlertHeaderNumCard
                  numLoading={numLoading}
                  iconColor={$color.gray}
                  icon="ll-nav-alert-filled"
                  text={i18next.t('未排除')}
                  num={`${_unSolvePercent}%`}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    paddingTop: 8,
                    paddingBottom: 8
                  }}
                />
                <LlAlertHeaderNumCard
                  numLoading={numLoading}
                  iconColor={$color.gray}
                  icon="ws-filled-alert-cancel"
                  text={i18next.t('已排除')}
                  num={`${_solvePercent}`}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    paddingTop: 8,
                    paddingBottom: 8
                  }}
                />
              </WsFlex>
            </>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default React.memo(AlertListTab)
