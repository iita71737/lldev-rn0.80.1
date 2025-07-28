import React, { useState } from 'react'
import {
  WsText,
  LlToggleTabBar001,
  WsIconBtn,
  WsState,
  WsPage,
  WsSkeleton,
  WsPage002
} from '@/components'
import i18next from 'i18next'
import Cooperate from '@/sections/Contractors/Cooperate'
import InCorporate from '@/sections/Contractors/InCorporate'
import { useSelector } from 'react-redux'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import S_Processor from '@/services/app/processor'
import S_ContractorType from '@/services/api/v1/contractor_type'
import S_CustomContractorType from '@/services/api/v1/contractor_customized_type'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import ContractorLicenseList from '@/sections/Contractors/ContractorLicenseList'
import ContractorsList from '@/views/Contractors/ContractorsList/ContractorsList'

const ContractorsIndex = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  const _tabIndex = route?.params?.tabIndex

  // redux
  const systemClasses = useSelector(state => state.data.systemClasses)

  // State
  const [tabFocus, setTabFocus] = useState()
  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [toggleTabs, setToggleTabs] = useState([
    {
      value: 'contractorList',
      label: t('承攬商列表'),
      view: ContractorsList,
      props: {
      }
    },
    {
      value: 'contractorLicenseList',
      label: t('資格證公版'),
      view: ContractorLicenseList,
      props: {
      }
    }
  ])

  const [searchValue, setSearchValue] = React.useState()

  // Storage
  const $_rightOnPress = async () => {
    navigation.navigate('ContractorCreate')
  }

  return (
    <>
      <WsPage002
        rightOnPress={() => rightIconOnPress()}
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      >
      </WsPage002>
    </>
  )
}

export default ContractorsIndex
