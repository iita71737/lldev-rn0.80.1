import React, { useState, useEffect, useCallback } from 'react'
import { Text, View, ScrollView } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  LlBtn002,
  WsPage,
  LlContractorEnterCard001,
  WsFilter,
  WsFlex,
  WsState,
  WsPageIndex
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import S_Contractor from '@/services/api/v1/contractor'
import { useTranslation } from 'react-i18next'
import S_Factory from '@/services/api/v1/factory'
import H_factory from "@/helpers/factory"
import { useNavigationState } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

interface Item {
  id: string | undefined;
  label: string | undefined;
  items: Item[] | undefined;
}

const ContractorEnter = ({ navigation, route }: { navigation: any, route: any }) => {
  const { t } = useTranslation()

  const {
  } = route.params

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // States
  const [contractor, setContractor] = React.useState([])
  const [factoryFilter, setFactoryFilter] = React.useState<Item[] | undefined>(undefined);
  const [filterFields, setFilterFields] = React.useState({})

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      factory: currentViewMode === 'organization' && currentOrganization ? currentOrganization.id : currentFactory && currentFactory.id ? currentFactory.id : undefined,
      target_factory: currentViewMode === 'organization' && currentOrganization ? currentOrganization.id : currentFactory && currentFactory.id ? currentFactory.id : undefined,
      order_by: "enter_start_date",
      order_way: "desc",
    }
    return params
  }, [navigation, currentViewMode]);

  // INIT
  const $_initFilterFields = () => {
    setFilterFields({
      contractor: {
        type: 'checkbox',
        label: t('承攬商'),
        items: contractor,
        searchVisible: true,
      },
      enter_status: {
        type: 'checkbox',
        label: t('進場狀態'),
        items: [
          {
            id: 'in_progress',
            name: t('進行中'),
          },
          {
            id: 'deferred',
            name: t('展延中'),
          },
          {
            id: 'complete',
            name: t('已完工'),
          },
          {
            id: 'suspend',
            name: t('已停工'),
          }
        ],
      },
      exit_checklist_status: {
        type: 'checkbox',
        label: t('收工檢查狀態'),
        items: [
          {
            id: 'uncheck',
            name: t('收工未檢查'),
          },
          {
            id: 'no_enter',
            name: t('無進場'),
          },
          {
            id: 'return',
            name: t('已復歸'),
          },
          {
            id: 'no_return',
            name: t('未復歸'),
          },
          {
            id: 'complete_return',
            name: t('收工且復歸'),
          }
        ],
      },
      system_subclasses: {
        type: 'system_subclass',
        label: t('領域')
      },
      button: {
        type: 'date_range',
        label: t('預計進場日期'),
        order_way: 'desc',
        order_by: 'enter_start_date',
        time_field: 'enter_start_date'
      },
      target_factory: {
        type: 'multiLayerToggle',
        label: t('單位'),
        items: factoryFilter
      },
    })
  }

  // Services
  const $_fetchContractor = async () => {
    const res = await S_Contractor.index({
      params: currentFactory.id
    })
    setContractor(res.data)
  }

  // INIT FILTER
  const $_setFilterFields = async (): Promise<void> => {
    try {
      let items: Item[] = []
      if (currentViewMode == 'organization' && currentOrganization) {
        let params = {
          organization: currentViewMode == 'factory' && currentFactory ? currentFactory.id : currentViewMode == 'organization' && currentOrganization ? currentOrganization.id : null
        }
        const res = await S_Factory.userIndex({ params })
        items = H_factory.getOrganizationFactoryScopeList(res.data);
        items.unshift({
          id: currentOrganization ? currentOrganization.id : null,
          label: t("本單位"),
          items: [],
        })
        items.unshift({
          id: 'all',
          label: t("全部"),
          items: [],
        })
        const _formatted = S_Factory.formattedChildFactoriesToItems(items)
        setFactoryFilter(_formatted)
      } else if (currentViewMode == 'factory' && currentFactory) {
        let params = {
          organization: currentViewMode == 'factory' && currentFactory && currentFactory.id ? currentFactory.id : undefined
        }
        const res = await S_Factory.userIndex({ params })
        items = H_factory.getOrganizationFactoryScopeList(res.data);
        items.unshift({
          id: currentFactory ? currentFactory.id : currentOrganization ? currentOrganization.id : null,
          label: t("本單位"),
          items: [],
        })
        items.unshift({
          id: 'all',
          label: t("全部"),
          items: [],
        })
        const _formatted = S_Factory.formattedChildFactoriesToItems(items)
        setFactoryFilter(_formatted)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const $_setStorage = async () => {
    const _defaultValue = {
      // task_content: t(
      //   '外部廠商進場：維修C棟排煙系統，C棟排煙系統凌晨1：00-17：00關閉'
      // ),
      // exit_check_item: t('經確認及清點完成復歸之機器或設備，應確實紀錄。')
    }
    const _value = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('ContractorEnterCreate', _value)
  }

  React.useEffect(() => {
    if (currentFactory) {
      $_fetchContractor()
    }
    $_setFilterFields()
  }, [currentFactory])

  React.useEffect(() => {
    if (contractor) {
      $_initFilterFields()
    }
  }, [contractor])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    });

    return unsubscribe;
  }, [navigation, currentFactory]);

  useFocusEffect(
    useCallback(() => {
    }, [])
  )

  return (
    <>
      <WsPageIndex
        modelName={'contractor_enter_record'}
        serviceIndexKey={'indexV2'}
        params={_params}
        filterFields={filterFields}
        defaultFilterValue={{
          target_factory: currentViewMode === 'organization' && currentOrganization ? currentOrganization.id : currentFactory && currentFactory.id ? currentFactory.id : undefined
        }}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlContractorEnterCard001
                item={item}
                onPress={() => {
                  navigation.navigate('ContractorEnterShow', {
                    id: item.id,
                  })
                }}
                style={[
                  index != 0
                    ? {
                      marginTop: 8
                    }
                    : null,
                  isLastItem ? {
                    marginBottom: 24
                  } : null
                ]}
              />
            </>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}
export default ContractorEnter
