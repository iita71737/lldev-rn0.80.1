import React, { useCallback } from 'react'
import {
  Alert
} from 'react-native'
import {
  WsTabView,
  WsSkeleton,
  LlBtn002,
  WsIconBtn,
  WsFilter002,
  WsModal
} from '@/components'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import LicenseStatusList from '@/sections/License/LicenseStatusList'
import i18next from 'i18next'
import S_License from '@/services/api/v1/license'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import PickTemplate from '@/views/License/Create/PickTemplate'
import PickTypeTemplate from '@/views/License/Create/PickTypeTemplate'
import { HeaderHeightContext } from '@react-navigation/elements';
interface LicenseListProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  tabFocus: string;
}

interface TabItem {
  value: string;
  label: string;
  view: any;
  props: {
    filterFields: any;
    filterValue: any;
    params: any;
    onParamsChange: (params: any, filterValue: any) => void;
  };
  tabNum: string | undefined;
}

const LicenseList: React.FC<LicenseListProps> = (props) => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
  } = props

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // STATES
  const [stateModal, setStateModal] = React.useState(false)

  const [loading, setLoading] = React.useState(true)
  const [overdueCount, setOverdueCount] = React.useState()
  const [inProcessCount, setInProcessCount] = React.useState()
  const [usingCount, setUsingCount] = React.useState()
  const [_disable, setDisable] = React.useState()
  const [allCount, setAllCount] = React.useState()

  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState<TabItem[] | undefined>();

  const [filterFields] = React.useState({
    license_type: {
      type: 'checkbox',
      label: i18next.t('類型'),
      storeKey: "licenseType",
    },
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })
  const [filterValue, setFilterValue] = React.useState()
  const [tabParams, setTabParams] = React.useState({
    order_by: 'valid_end_date',
    order_way: 'asc',
  })

  const $_setTabNum = async (_params?: { order_by?: string; order_way?: string; search?: string }) => {
    try {
      delete _params.license_status
      delete _params.order_by
      delete _params.order_way
      const res = S_License.tabIndex({
        params: _params
      })
      await Promise.all([res])
        .then(res => {
          setOverdueCount(res[0].data.status_0_count)
          setInProcessCount(res[0].data.status_1_count)
          setUsingCount(res[0].data.status_2_count)
          setDisable(res[0].data.status_3_count)
          setAllCount(res[0].data.total_count)
          setLoading(false)
        })
        .catch(() => {
          Alert.alert(t('伺服器忙碌中，請稍候再試'))
          navigation.navigate('LicenseIndex')
        })
    } catch (err) {
      console.error(err);
    }
  }

  // Function
  const $_onParamsChange = (_params?: { order_by: string; order_way: string; search?: string }, filtersValue: any) => {
    const _allParams = {
      ..._params,
    };
    setTabParams(_allParams)
    setFilterValue(filtersValue)
    $_setTabNum(_allParams);
  }

  // TAB
  const $_setTabItems = () => {
    const tabItemsData: TabItem[] = [
      {
        value: 'status_number0',
        label: i18next.t('逾期'),
        view: LicenseStatusList,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            order_by: 'valid_end_date',
            order_way: 'asc',
            license_status: 0,
            lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: overdueCount ? overdueCount : '0'
      },
      {
        value: 'status_number1',
        label: i18next.t('辦理中'),
        view: LicenseStatusList,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            order_by: 'valid_end_date',
            order_way: 'asc',
            license_status: 1,
            lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: inProcessCount ? inProcessCount : '0'
      },
      {
        value: 'status_number2',
        label: i18next.t('使用中'),
        view: LicenseStatusList,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            order_by: 'valid_end_date',
            order_way: 'asc',
            license_status: 2,
            lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: usingCount ? usingCount : '0'
      },
      {
        value: 'status_number3',
        label: i18next.t('已停用'),
        view: LicenseStatusList,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            order_by: 'valid_end_date',
            order_way: 'asc',
            license_status: 3,
            lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: _disable ? _disable : '0'
      },
      {
        value: 'LicenseStatusList',
        label: i18next.t('全部'),
        view: LicenseStatusList,
        props: {
          filterFields: filterFields,
          filterValue: filterValue,
          params: {
            ...tabParams,
            order_by: 'valid_end_date',
            order_way: 'asc',
          },
          onParamsChange: $_onParamsChange
        },
        tabNum: allCount ? allCount : '0'
      }
    ]
    setTabItems(tabItemsData)
    setLoading(false)
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsIconBtn
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              setStateModal(true)
            }}
          />
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }


  React.useEffect(() => {
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    $_setTabItems()
  }, [overdueCount, inProcessCount, usingCount, _disable, allCount, filterValue])

  return (
    <>
      {tabItems && !loading && (
        <WsTabView
          index={tabIndex}
          setIndex={settabIndex}
          items={tabItems}
          isAutoWidth={true}
        />
      )}

      <WsModal
        animationType={'none'}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        title={t('新增證照')}
      >
        <PickTypeTemplate
          title={t('新增證照')}
          setParentStateModal={setStateModal}
        ></PickTypeTemplate>
      </WsModal>
    </>
  )
}
export default LicenseList
