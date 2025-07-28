import React, { useState } from 'react'
import {
  ScrollView,
  Pressable,
  View,
  Dimensions,
  SafeAreaView
} from 'react-native'
import {
  WsTabView,
  WsIconBtn,
  WsState,
  WsSkeleton,
  WsPage,
  WsFilter,
  WsLoading
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import ChangeStatus from '@/sections/Change/ChangeStatus'
import S_Change from '@/services/api/v1/change'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'

interface TabItem {
  value: string;
  label: string;
  view: any;
  props: {
    filterFields: any;
    filterValue: any;
    params: any;
    onParamsChange: (params: any, filterValue: any) => void;
    searchValue: string;
  };
  tabNum: string | undefined;
}

const ChangeIndex: React.FC = (props) => {
  const navigation = useNavigation<any>()
  const { t } = useTranslation()

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [tabNum1, setTabNum1] = useState<number | undefined>();
  const [tabNum2, setTabNum2] = useState<number | undefined>();
  const [tabNum3, setTabNum3] = useState<number | undefined>();
  const [tabNum4, setTabNum4] = useState<number | undefined>();
  const [tabNum5, setTabNum5] = useState<number | undefined>();

  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: i18next.t('建立日期'),
      time_field: 'created_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })
  const [filterValue, setFilterValue] = useState<any>();
  const [tabParams, setTabParams] = useState<any>({
    change_status: '',
    order_way: 'desc',
    order_by: 'created_at',
    time_field: 'created_at',
  });
  const [tabIndex, settabIndex] = useState<number>(0);
  const [tabItems, setTabItems] = useState<TabItem[] | undefined>();

  // Services
  const $_setTabNum = async (_params: any = {}) => {
    delete _params.change_status
    try {
      const res = S_Change.tabIndex({
        params: _params
      })
      await Promise.all([res])
        .then(res => {
          setTabNum1(res[0].data.total_count)
          setTabNum2(res[0].data.status_1_count)
          setTabNum3(res[0].data.status_2_count)
          setTabNum4(res[0].data.status_3_count)
          setTabNum5(res[0].data.status_4_count)
          setLoading(false)
        })
    } catch (e) {
      console.error(e);
      setTabNum1(0)
      setTabNum2(0)
      setTabNum3(0)
      setTabNum4(0)
      setTabNum5(0)
    }
  }

  // Function
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

  const $_setTabItems = () => {
    const tabItemsData: TabItem[] = [
      {
        value: 'ChangeStatus0',
        label: t('全部'),
        view: ChangeStatus,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            change_status: '',
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: tabNum1 ? tabNum1 : '0'
      },
      {
        value: 'ChangeStatus1',
        label: t('評估中'),
        view: ChangeStatus,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            change_status: 1,
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: tabNum2 ? tabNum2 : '0'
      },
      {
        value: 'ChangeStatus3',
        label: t('執行中'),
        view: ChangeStatus,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            change_status: 3,
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: tabNum4 ? tabNum4 : '0'
      },
      {
        value: 'ChangeStatus2',
        label: t('中止'),
        view: ChangeStatus,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            change_status: 2,
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: tabNum3 ? tabNum3 : '0'
      },
      {
        value: 'ChangeStatus4',
        label: t('已結案'),
        view: ChangeStatus,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            change_status: 4,
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: tabNum5 ? tabNum5 : '0'
      }
    ]
    setTabItems(tabItemsData)
    setLoading(false)
  }
  const $_createChange = async () => {
    await AsyncStorage.removeItem('ChangeCreate')
    navigation.navigate('ChangeCreate')
  }

  React.useEffect(() => {
    $_setTabItems()
  }, [tabNum1, tabNum2, tabNum3, tabNum4, tabNum5, filterValue])

  // 切廠更新
  React.useEffect(() => {
    $_setTabNum(tabParams)
  }, [currentFactory])


  return (
    <>
      {/* <WsPage
        title={t('變動計畫列表')}
        // iconRight="md-add" //HIDE_FOR_CREATE
        rightOnPress={() => {
          $_createChange()
        }}
      > */}
        {tabItems && !loading && (
          <WsTabView
            index={tabIndex}
            scrollEnabled={true}
            setIndex={settabIndex}
            items={tabItems}
          />
        )}
      {/* </WsPage> */}
    </>
  )
}

export default ChangeIndex
