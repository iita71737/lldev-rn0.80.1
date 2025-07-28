import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsIcon,
  WsAvatar,
  WsTag,
  WsInfoImage,
  LlInfoContainer001,
  WsModal,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  LlContractorLicenseCard001
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { useTranslation } from 'react-i18next'
import S_ContractorContract from '@/services/api/v1/contract'
import AsyncStorage from '@react-native-community/async-storage'

const ContractorsContractShow = ({ navigation, route, props }) => {
  const { t, i18n } = useTranslation()
  // Dimensions
  const windowWidth = Dimensions.get('window').width
  const windowHeight = Dimensions.get('window').height

  // Props
  const { id } = route.params

  // States
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)
  const [contractorContract, setContractorContract] = React.useState()
  const [contractorId, setContractorId] = React.useState()
  const [contractLicenseState, setContractLicenseState] = React.useState([])


  // SERVICES
  const $_fetchContract = async () => {
    const res = await S_ContractorContract.show({ contractId: id }).then(
      async res => {
        setContractorContract(res)
        setContractorId(res.contractor.id)
        const contractorLicenseStateArr = res.licenses.map(r => {
          const contract_state = S_ContractorContract.getLicenseStatus({
            nowDate: moment(new Date()),
            endDate: moment(r.last_version.valid_end_date),
            contractEndDate: moment(res.valid_end_date)
          })
          return contract_state
        })
        setContractLicenseState(contractorLicenseStateArr)
      }
    )
  }

  // Storage
  const $_setStorage = async value => {
    const _data = {
      ...value,
      contractor: value.contractor ? value.contractor.id : null,
      contractor_name: value.contractor ? value.contractor.name : null,
      contractor_licenses: value.licenses ? value.licenses : null
    }
    const _value = JSON.stringify(_data)
    await AsyncStorage.setItem('ContractorsContractCreate', _value)
    await AsyncStorage.setItem('ContractorsContractEdit', _value)
  }

  // HELPER
  const $_ContractState = (date) => {
    const _contractState = S_ContractorContract.getLicenseStatus({
      nowDate: moment(new Date()),
      endDate: moment(date),
    })
    return _contractState
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: t('承攬商契約'),
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
              onPress={async () => {
                setIsBottomSheetActive(true)
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
          name: 'ContractorsContractEdit',
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
    if (id) {
      $_fetchContract()
    }
  }, [id])

  React.useEffect(() => {
    $_setBottomSheet()
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    $_setStorage(contractorContract)
  }, [contractorContract])

  return (
    <>
      <ScrollView>
        {contractorContract && contractLicenseState.length > 0 && (
          <>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsText size={24}>{contractorContract.name}</WsText>
            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                {contractorContract.updated_user ? (
                  <WsAvatar
                    size={40}
                    source={
                      contractorContract.updated_user.avatar
                        ? contractorContract.updated_user.avatar
                        : ''
                    }
                  />
                ) : (
                  <WsAvatar
                    size={40}
                    source={
                      'https://i1.jueshifan.com/7b077d83/78067d8b/31073d8a09acfa4c9c38.png'
                    }
                  />
                )}
                <View
                  style={{
                    marginLeft: 8
                  }}>
                  {contractorContract.updated_user ? (
                    <WsText color={$color.gray}>
                      {t(contractorContract.updated_user.name)}
                    </WsText>
                  ) : (
                    <WsText color={$color.gray}>{t('曹阿毛')}</WsText>
                  )}
                  <WsText color={$color.gray}>
                    {t('編輯時間')}
                    {contractorContract.updated_at
                      ? moment(contractorContract.updated_at).format(
                        'YYYY-MM-DD HH:MM'
                      )
                      : moment().format('YYYY-MM-DD HH:MM')}
                  </WsText>
                </View>
              </View>
            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}>
              <WsInfo
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4
                }}
                labelWidth={128}
                label={t('承攬商名稱')} // 不能簡化
                value={t(contractorContract.contractor.name)}
              />
              <WsFlex>
                <WsText
                  style={{
                    width: 128
                  }}
                  size={14} fontWeight="700" letterSpacing={1}>
                  {t('契約狀態')}
                </WsText>
                <WsTag
                  size={12}
                  textColor={
                    contractLicenseState.includes(2) ? $color.danger : $color.danger
                  }
                  backgroundColor={
                    contractLicenseState.includes(2) ? $color.danger11l : $color.danger11l
                  }
                  style={{
                    marginRight: 4
                  }}>
                  {contractLicenseState.includes(2)
                    ? t('資格逾期')
                    : contractLicenseState.includes(1)
                      ? t('資格風險')
                      : t('')}
                </WsTag>

                {contractorContract &&
                  contractorContract.valid_end_date &&
                  $_ContractState(contractorContract.valid_end_date) != 0 && (
                    <WsFlex>
                      <WsTag
                        backgroundColor={
                          $_ContractState(contractorContract.valid_end_date)
                            ? $color.danger11l
                            : $color.primary11l
                        }
                        textColor={
                          $_ContractState(contractorContract.valid_end_date) == 2 ? $color.danger : $color.primary
                        }>
                        {$_ContractState(contractorContract.valid_end_date) == 2
                          ? t('契約逾期')
                          : $_ContractState(contractorContract.valid_end_date) == 1
                            ? t('契約風險')
                            : ''}
                      </WsTag>
                    </WsFlex>
                  )}
              </WsFlex>

              <WsInfo
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                }}
                labelWidth={128}
                label={t('契約起迄')}
                value={`${moment(contractorContract.valid_start_date).format(
                  'YYYY-MM-DD'
                )} - ${moment(contractorContract.valid_end_date).format(
                  'YYYY-MM-DD'
                )}`}
              />
              <WsInfo
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                }}
                labelWidth={128}
                label={t('提醒日期')}
                icon="ll-nav-alert-outline"
                color={$color.primary3l}
                value={
                  contractorContract.remind_date
                    ? moment(contractorContract.remind_date).format(
                      'YYYY-MM-DD'
                    )
                    : t('未設定')
                }
              />

              {contractorContract.reminder && (
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                  labelWidth={128}
                  label={t('管理者')}
                  color={$color.primary3l}
                  type={'user'}
                  value={contractorContract.reminder}
                />
              )}

            </WsPaddingContainer>

            {contractorContract.file_attaches && (
              <WsPaddingContainer
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  type="files"
                  label={t('附件')}
                  value={contractorContract.file_attaches}
                />
              </WsPaddingContainer>
            )}

            {contractorContract.licenses.length != 0 && (
              <>
                <ScrollView
                  testID={'ScrollView'}
                >
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                      marginTop: 8
                    }}>
                    <WsText
                      style={{
                        marginBottom: 16
                      }}
                      size={14}
                      fontWeight="600"
                      letterSpacing={1}>
                      {t('綁定資格證')}
                    </WsText>
                    {contractorContract.licenses.map(
                      (license, licenseIndex) => {
                        return (
                          <LlContractorLicenseCard001
                            testID={`LlContractorLicenseCard001-${licenseIndex}`}
                            contractorState={
                              contractLicenseState ? contractLicenseState[licenseIndex] : ''
                            }
                            key={licenseIndex}
                            license={license}
                            contractor={contractorContract.contractor}
                            style={[licenseIndex != 0 ? { marginTop: 16 } : null]}
                            onPress={() => {
                              navigation.navigate({
                                name: 'ContractorsLicenseShow',
                                params: {
                                  id: license.id
                                }
                              })
                            }}
                          />
                        )
                      }
                    )}
                  </WsPaddingContainer>
                </ScrollView>
              </>
            )}
          </>
        )}
      </ScrollView>
      <WsModal
        title={t('法規依據')}
        visible={stateModal}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        onBackButtonPress={() => {
          setStateModal(false)
        }}>
        <ViewArticleShowForModal versionId={selectVersionId} />
      </WsModal>
      <WsBottomSheet
        // underlayColor={$color.gray}
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
      {contractorId && (
        <WsDialogDelete
          id={id}
          to="ContractorsShow"
          toParams={contractorId}
          modelName="contract"
          visible={dialogVisible}
          text={t('確定刪除嗎？')}
          setVisible={setDialogVisible}
        />
      )}
    </>
  )
}
export default ContractorsContractShow
