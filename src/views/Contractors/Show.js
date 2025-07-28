import React from 'react'
import {
  ScrollView,
  Pressable,
  View
} from 'react-native'
import {
  WsTabView,
  WsText,
  WsTag,
  WsPaddingContainer,
  WsFlex,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  WsSkeleton,
  WsAvatar
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import S_Contractor from '@/services/api/v1/contractor'
import S_ContractorLicense from '@/services/api/v1/contractor_license'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class.js'
import BasicData from '@/sections/Contractors/BasicData'
import License from '@/sections/Contractors/License'
import Contract from '@/sections/Contractors/Contract'
import ContractorEnter from '@/sections/Contractors/ContractorEnter'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setCurrentContractorBasicData } from '@/store/data'

const ContractorsShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // State
  const [loading, setLoading] = React.useState(true)

  const [hasDue, setHasDue] = React.useState()
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([])
  const [contractor, setContractor] = React.useState()
  const [contractorLicenses, setContractorLicenses] = React.useState()

  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // Services
  const $_fetchContractors = async () => {
    try {
      // 承攬商基本資料
      const res = await S_Contractor.show({ modelId: id })
      setContractor(res)
      const _res = {
        ...res,
        system_classes: S_SystemClass.getSystemClassBySystemSubclassId(
          res.system_subclasses
        )
      }
      store.dispatch(setCurrentContractorBasicData(_res))
      $_setStorage(_res)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  const $_fetchContractorsLicense = async () => {
    try {
      // 承攬商資格證
      const _params = {
        contractor: id,
        parentId: factoryId
      }
      const _contractorLicenses = await S_ContractorLicense.index({
        params: _params
      })
      setContractorLicenses(_contractorLicenses.data)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // Storage
  const $_setStorage = async value => {
    const _data = {
      ...value,
      contractor: value.id,
      contractor_name: value.name
    }
    const _value = JSON.stringify(_data)
    await AsyncStorage.setItem('ContractorsContractCreate', _value)
    await AsyncStorage.setItem('ContractorEdit', _value)
  }

  const $_setTabItems = () => {
    if (contractor) {
      setTabItems([
        {
          value: 'BasicData',
          label: t('基本資料'),
          view: BasicData,
          props: {
            navigation: navigation,
            contractor: contractor ? contractor : []
          }
        },
        {
          value: 'License',
          label: t('資格證管理'),
          view: License,
          props: {
            navigation: navigation,
            contractor: contractor,
            contractorLicenses: contractorLicenses ? contractorLicenses : undefined
          }
        },
        {
          value: 'Contract',
          label: t('契約管理'),
          view: Contract,
          props: {
            navigation: navigation,
            contractor: contractor ? contractor : []
          }
        },
        {
          value: 'ContractorEnter',
          label: t('進場記錄'),
          view: ContractorEnter,
          props: {
            navigation: navigation,
            route: route,
            contractor: contractor ? contractor : [],
            target_factory: factoryId
          }
        }
      ])
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            {/* 230913-HIDDEN */}
            {/* <WsIconBtn
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                setIsBottomSheetActive(!isBottomSheetActive)
              }}
            /> */}
          </>
        )
      }
    })
  }

  const $_setBottomSheet = () => {
    setBottomSheetItems([
      {
        to: {
          name: 'ContractorEdit',
          params: {
            id: id,
            modelId: id
          }
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯')
      },
      {
        onPress: () => {
          setDialogVisible(true)
        },
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除')
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
    $_fetchContractors()
    if (tabIndex === 1) {
      $_fetchContractorsLicense()
    }
  }, [tabIndex, route, navigation])

  React.useEffect(() => {
    // $_setBottomSheet()
    // $_setNavigationOption()
  }, [route])

  React.useEffect(() => {
    if (contractor || contractorLicenses) {
      $_setTabItems()
    }
  }, [contractor, contractorLicenses])

  React.useEffect(() => {
    // $_setNavigationOption()
  }, [isBottomSheetActive])

  return (
    <>
      {contractor ? (
        <>
          <WsPaddingContainer
            padding={0}
            style={{
              paddingHorizontal: 16,
              backgroundColor: $color.white
            }}>
            <WsFlex
              style={{
                flexWrap: 'wrap'
              }}
              justifyContent="flex-start"
            >
              {contractor.review == 0 && (
                <WsTag
                  style={{ marginLeft: 4 }}
                  backgroundColor={$color.danger11l}
                  textColor={$color.danger}>
                  {t('拒絕往來')}
                </WsTag>
              )}
            </WsFlex>
            <WsText
              style={{
                marginVertical: 8,
                marginLeft: 4
              }}
              size={24}>
              {contractor.name}
            </WsText>
            {contractor.system_subclasses && (
              <WsFlex flexWrap="wrap">
                {contractor.system_subclasses.map(
                  (subClass, subClassIndex) => {
                    return (
                      <WsTag
                        key={subClassIndex}
                        img={subClass.icon}
                        style={{
                          marginBottom: 8,
                          marginRight: 8
                        }}>
                        {t(subClass.name)}
                      </WsTag>
                    )
                  }
                )}
              </WsFlex>
            )}

            {contractor && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                {contractor.updated_user?.avatar && (
                  <WsAvatar
                    size={40}
                    source={contractor.updated_user?.avatar}
                  />
                )}
                {contractor.updated_user?.name &&
                  contractor.updated_at && (
                    <View
                      style={{
                        marginLeft: 8
                      }}>
                      <WsText color={$color.gray}>
                        {t(contractor.updated_user?.name)}
                      </WsText>
                      <WsText color={$color.gray}>
                        {t('編輯時間')}{' '}
                        {moment(contractor.updated_at).format(
                          'YYYY-MM-DD HH:MM'
                        )}
                      </WsText>
                    </View>
                  )
                }
              </View>
            )}
          </WsPaddingContainer>

          {contractor &&
            tabItems &&
            tabItems.length > 0 ? (
            <WsTabView
              items={tabItems}
              scrollEnabled={false}
              isAutoWidth={true}
              index={tabIndex}
              setIndex={settabIndex}
            />
          ) : (
            <>
              <WsSkeleton />
            </>
          )}
        </>
      ) : (
        <WsSkeleton />
      )}
      <WsBottomSheet
        snapPoints={['25%', '25%']}
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
      <WsDialogDelete
        id={id}
        to="ContractorsIndex"
        modelName="contractor"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}

export default ContractorsShow
