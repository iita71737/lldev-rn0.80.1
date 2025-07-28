import React from 'react'
import AsyncStorage from '@react-native-community/async-storage'
import { WsTabView, WsSkeleton, WsTabView002, WsLoading } from '@/components'
import Services from '@/services/api/v1/index'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import { useNavigation } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native'
import i18next from 'i18next'
import S_Alert from '@/services/api/v1/alert'
import { useFocusEffect } from '@react-navigation/native'
import AlertListTab from '@/sections/Alert/AlertListTabView/AlertListTab'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setIdleCounter } from '@/store/data';
import { useTranslation } from 'react-i18next'

interface TabItem {
  value: string;
  label: string;
  view: React.ComponentType<any>;
  props: {
    solved_at: string | undefined;
    _unSolvePercent: string;
    _solvePercent: string;
    numLoading: boolean;
    alertNum: number;
    early: number;
    onParamsChange: (params: any, filtersValue: any) => void;
    filterValue: string | undefined;
  };
}

const AlertListTabView = (props) => {
  const { t, i18n } = useTranslation()

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)

  // State
  const [loading, setLoading] = React.useState<boolean>(true);

  const [tabIndex, settabIndex] = React.useState<number>(0);
  const [tabItems, setTabItems] = React.useState<TabItem[]>([]);

  const [noneSolveNum, setNoneSolveNum] = React.useState<number>(0);
  const [solvedNum, setSolvedNum] = React.useState<number>(0);
  const [totalNum, setTotalNum] = React.useState<number>(0);

  const [filterValue] = React.useState<any>({
    from: [
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
  });
  const [numLoading, setNumLoading] = React.useState<boolean>(false);
  const [alertNum, setAlertNum] = React.useState<number>(0);
  const [early, setEarly] = React.useState<number>(0);

  // Function
  const $_setTabItems = (): void => {
    setTabItems([
      {
        value: 'NoneSolve',
        label: `${i18next.t('未排除')} (${noneSolveNum ? noneSolveNum : '0'})`,
        view: AlertListTab,
        props: {
          solved_at: 'null',
          _unSolvePercent: totalNum > 0 ? (((noneSolveNum / totalNum) * 1000) / 10).toFixed(1) : '0.0',
          _solvePercent: totalNum > 0 ? `${(((solvedNum / totalNum) * 1000) / 10).toFixed(1)}%` : '0.0',
          numLoading: numLoading,
          alertNum: alertNum ? alertNum : '0',
          early: early ? early : '0',
          filterValue: filterValue,
          onParamsChange: $_onParamsChange,
        },
      },
      {
        value: 'Solved',
        label: `${i18next.t('已排除')} (${solvedNum ? solvedNum : '0'})`,
        view: AlertListTab,
        props: {
          solved_at: 'not_null',
          _unSolvePercent: totalNum > 0 ? (((noneSolveNum / totalNum) * 1000) / 10).toFixed(1) : '0.0',
          _solvePercent: totalNum > 0 ? `${(((solvedNum / totalNum) * 1000) / 10).toFixed(1)}%` : '0.0',
          numLoading: numLoading,
          alertNum: alertNum ? alertNum : '0',
          early: early ? early : '0',
          filterValue: filterValue,
          onParamsChange: $_onParamsChange,
        },
      },
      {
        value: 'All',
        label: `${i18next.t('全部')} (${totalNum ? totalNum : '0'})`,
        view: AlertListTab,
        props: {
          solved_at: undefined,
          _unSolvePercent: totalNum > 0 ? (((noneSolveNum / totalNum) * 1000) / 10).toFixed(1) : '0.0',
          _solvePercent: totalNum > 0 ? (((solvedNum / totalNum) * 1000) / 10).toFixed(1) : '0.0',
          numLoading: numLoading,
          alertNum: alertNum ? alertNum : '0',
          early: early ? early : '0',
          filterValue: filterValue,
          onParamsChange: $_onParamsChange,
        },
      },
    ])
    setLoading(false)
  }

  // Services
  const $_setTabNum = async (_params: any = {}) => {
    delete _params.solved_at
    try {
      const res = await S_Alert.tabIndex({ params: _params })
      await Promise.all([res])
        .then(res => {
          setNoneSolveNum(res[0].data?.unsolved_count)
          setSolvedNum(res[0].data?.solved_count)
          setTotalNum(res[0].data?.total_count)
          setAlertNum(res[0].data?.level_2_count)
          setEarly(res[0].data?.level_1_count)
          setNumLoading(false)
        })
    } catch (e) {
      console.error(e);
      setNoneSolveNum(0)
      setSolvedNum(0)
      setTotalNum(0)
      setAlertNum(0)
      setEarly(0)
    }
  }

  const $_onParamsChange = (params: any, filtersValue: any) => {
    console.log('$_onParamsChange');
    $_setTabNum(params)
  }

  React.useEffect(() => {
    $_setTabNum()
  }, [])

  React.useEffect(() => {
    if (
      noneSolveNum !== undefined &&
      solvedNum !== undefined &&
      totalNum !== undefined &&
      early !== undefined &&
      alertNum !== undefined
    ) {
      $_setTabItems();
    }
  }, [noneSolveNum, solvedNum, totalNum, early, alertNum]);

  React.useEffect(() => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  }, [tabIndex])

  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : (
        <WsTabView002
          isAutoWidth={true}
          items={tabItems}
          index={tabIndex}
          setIndex={settabIndex}
        />
      )}
    </>
  )
}

export default AlertListTabView
