import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, Alert } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { WsStepsTab } from '@/components'
import ExitChecklistCreateStep from '@/sections/ContractorEnter/ExitChecklistCreateStep'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setRefreshCounter,
} from '@/store/data'

const ExitChecklistProcedure = ({ route, navigation }) => {
  // Params
  const {
    enterDate,
    _exit_checklist_assignment,
    _enterStatus,
    _remark,
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // State
  const [contractorEnter] = React.useState(_exit_checklist_assignment)
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'hasContractorEnter',
      props: {
        contractorEnter: contractorEnter,
        page: 1
      }
    },
    {
      value: 'exit_check_item',
      props: {
        contractorEnter: contractorEnter,
        page: 2
      }
    },
    {
      value: 'final_check_score',
      props: {
        contractorEnter: contractorEnter,
        page: 3
      }
    }
  ])

  // Function
  const $_stepOnChange = (itemIndex, $event, stateKey, item) => {
    if (item && $event && stateKey == 'enter_score') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'enter_attaches') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'enter_remark') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'exit_check_item_score') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'exit_check_item_remark') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'exit_check_item_attaches') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'final_check_score') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'final_check_remark') {
      item[stateKey] = $event
    }
    if (item && $event && stateKey == 'final_check_attaches') {
      item[stateKey] = $event
    }
    if ($event == 36 || $event == 46) {
      setTabItems([
        {
          value: 'hasContractorEnter',
          props: {
            contractorEnter: item,
            page: 1
          }
        },
        {
          value: 'exit_check_item',
          props: {
            contractorEnter: item,
            page: 2
          }
        },
        {
          value: 'final_check_score',
          props: {
            contractorEnter: item,
            page: 3
          }
        }
      ])
    } else if ($event == 37) {
      setTabItems([
        {
          value: 'hasContractorEnter',
          props: {
            contractorEnter: item,
            page: 1
          }
        }
      ])
    }
  }
  const $_putApi = async ($event) => {
    try {
      const createData = S_ExitChecklist.getExitChecklistCreateData(
        contractorEnter,
        enterDate,
        $event,
        _enterStatus,
        _remark,
      )
      console.log(JSON.stringify(createData), 'createData');
      const res = await S_ExitChecklist.create(createData)
      Alert.alert('收工檢查建立成功')
    } catch (e) {
      console.error(e);
      Alert.alert('收工檢查建立失敗')
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'ContractorEnter',
          params: {
          }
        },
      ],
    });
    setTimeout(() => {
      navigation.push('ContractorEnterShow', {
        id: contractorEnter && contractorEnter.contractor_enter_record && contractorEnter.contractor_enter_record.id ? contractorEnter.contractor_enter_record.id : null,
        tabIndex: 1,
      });
    }, 2000);
  }
  const $_onSubmit = $event => {
    const _validation = S_ExitChecklist.validationQuestionSubmit($event)
    if (_validation === false) {
      Alert.alert(i18next.t('尚未填寫備註'))
      return
    }
    $_putApi($event)
  }

  const $_backPreview = () => {
    navigation.goBack()
  }

  // Render
  return (
    <>
      {contractorEnter && (
        <WsStepsTab
          currentTabIndex={currentTabIndex}
          setCurrentTabIndex={setCurrentTabIndex}
          items={tabItems}
          title={i18next.t('收工檢查表')}
          onChange={(itemIndex, $event, stateKey, item) => {
            $_stepOnChange(itemIndex, $event, stateKey, item)
          }}
          onSubmit={$event => {
            $_onSubmit($event)
          }}
          viewComponent={ExitChecklistCreateStep}
          backBtnOnPress={() => $_backPreview()}
          swipeEnabled={false}
        />
      )}
    </>
  )
}

export default ExitChecklistProcedure
