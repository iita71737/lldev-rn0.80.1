import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView } from 'react-native'
import {
  WsTabView,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  WsLoadingDot,
  WsErrorMessage
} from '@/components'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import ContractorEnterRecordExitCheck from '@/sections/ContractorEnter/ContractorEnterRecordExitCheck'
import ContractorEnterList from '@/sections/ContractorEnter/ContractorEnterList'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { WsSkeleton } from '@/components'

const ContractorEnterShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params
  const initIndex = route.params?.tabIndex

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'ContractorEnterList',
      label: t('資訊'),
      view: ContractorEnterList,
      props: {
        id: id,
        navigation: navigation,
        factory: currentFactory
      }
    },
    {
      value: 'ExitChecklists',
      label: t('收工檢查'),
      view: ContractorEnterRecordExitCheck,
      props: {
        id: id,
        navigation: navigation,
        factory: currentFactory
      }
    },
  ])
  const [contractorEnter, setContractorEnter] = React.useState()
  const [contractor, setContractor] = React.useState()

  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [showError, setShowError] = React.useState(false)

  // Services
  const $_fetchContractorEnter = async () => {
    try {
      const res = await S_ContractorEnterRecord.show({ modelId: id })
      setContractorEnter(res)
      if (res.contractor) {
        setContractor(res.contractor)
      }
      $_setStorage(res)
    }
    catch (e) {
      setShowError(true)
      console.error(e)
    }
  }

  // Storage
  const $_setStorage = async value => {
    const _value = JSON.stringify(value)
    await AsyncStorage.setItem('ContractorEnterUpdate', _value)
  }

  // Function
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight:
        currentUser
          && contractorEnter
          && contractorEnter.owner
          && currentUser.id === contractorEnter.owner.id
          ? () => {
            return (
              <WsIconBtn
                name="ws-outline-edit-pencil"
                color={$color.white}
                size={24}
                style={{
                  marginRight: 4
                }}
                onPress={() => {
                  setIsBottomSheetActive(!isBottomSheetActive)
                }}
              />
            )
          }
          : () => { },
      headerLeft: () => {
        return (
          <>
            <WsIconBtn
              testID={'backButton'}
              name="ws-outline-arrow-left"
              color={$color.white}
              size={24}
              style={{
              }}
              onPress={() => {
                  navigation.goBack()
              }}
            />
          </>
        )
      }
    })
  }

  const $_initTab = () => {
    setTabItems([
      {
        value: 'ContractorEnterList',
        label: t('資訊'),
        view: ContractorEnterList,
        props: {
          id: id,
          navigation: navigation,
          factory: currentFactory
        }
      },
      {
        value: 'ExitChecklists',
        label: t('收工檢查'),
        view: ContractorEnterRecordExitCheck,
        props: {
          id: id,
          navigation: navigation,
          factory: currentFactory,
          contractor: contractor ? contractor : null,
        }
      },
    ])
  }

  const $_setBottomSheetItems = () => {
    setBottomSheetItems([
      currentUser && contractorEnter.creator.id == currentUser.id
        ? {
          to: { name: 'ContractorEnterUpdate', params: { id: id } },
          icon: 'ws-outline-edit-pencil',
          labelColor: $color.primary,
          label: t('編輯')
        }
        : {
          label: t('無編輯權限'),
          icon: 'ws-outline-edit-pencil',
          onPress: () => { }
        },
      currentUser && contractorEnter.creator.id == currentUser.id
        ? {
          onPress: () => {
            setDialogVisible(true)
          },
          icon: 'ws-outline-delete',
          color: $color.danger,
          labelColor: $color.danger,
          label: t('刪除')
        }
        : {
          label: t('無編輯權限'),
          icon: 'ws-outline-edit-pencil',
          onPress: () => { }
        }
    ])
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  React.useEffect(() => {
    setContractorEnter(null)
    setShowError(false)
    $_initTab()
    $_fetchContractorEnter()
    // $_setNavigationOption()
  }, [id])

  React.useEffect(() => {
    if (contractorEnter) {
      $_setBottomSheetItems()
    }
  }, [contractorEnter])

  React.useEffect(() => {
    if (contractor) {
      $_initTab()
    }
  }, [contractor])


  React.useEffect(() => {
    if (initIndex) {
      settabIndex(initIndex)
    }
  }, [initIndex])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setContractorEnter(null)
      setShowError(false)
      $_initTab()
      $_fetchContractorEnter()
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <>
      {showError &&
        (
          <View
            style={{
              paddingTop: 16
            }}
          >
            <WsErrorMessage fontSize={18}>{t('查無資料或已刪除')}</WsErrorMessage>
          </View>
        )
      }
      {contractorEnter ? (
        <>
          <WsTabView
            isAutoWidth={true}
            items={tabItems}
            index={tabIndex}
            setIndex={settabIndex}
          />
          <WsBottomSheet
            isActive={isBottomSheetActive}
            onDismiss={() => {
              setIsBottomSheetActive(false)
            }}
            items={bottomSheetItems}
            snapPoints={[148, 160]}
            onItemPress={$_onBottomSheetItemPress}
          />
          <WsDialogDelete
            id={id}
            to="ContractorEnter"
            modelName="contractor_enter_record"
            visible={dialogVisible}
            title={t('確定刪除嗎？')}
            setVisible={setDialogVisible}
          />
        </>
      ):(
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

export default ContractorEnterShow
