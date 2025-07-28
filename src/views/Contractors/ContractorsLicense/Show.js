import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Alert,
  Keyboard
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
  LlBtn002,
  WsState,
  WsVersionHistory
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { useTranslation } from 'react-i18next'
import S_ContractorLicense from '@/services/api/v1/contractor_license'
import S_ContractorLicenseVersion from '@/services/api/v1/contractor_license_version'
import AsyncStorage from '@react-native-community/async-storage'
import i18next from 'i18next'
import factory from '@/services/api/v1/factory'
import { useSelector } from 'react-redux'
import licenseFields from '@/models/license'

const ContractorsLicenseShow = ({ navigation, route, props }) => {
  const { t, i18n } = useTranslation()
  const windowWidth = Dimensions.get('window').width
  const windowHeight = Dimensions.get('window').height

  // redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Props
  const { id } = route.params

  console.log(id,'ContractorsLicenseShow =id=');

  // States
  const [lastVersionId, setLastVersionId] = React.useState()
  const [remarkInput, setRemarkInput] = React.useState(false)
  const [remark, setRemark] = React.useState()

  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)
  const [contractorLicense, setContractorLicense] = React.useState()

  const [stateModal002, setStateModal002] = React.useState(false)

  // SERVICES
  const $_fetchContractLicense = async () => {
    try {
      const res = await S_ContractorLicense.show({ modelId: id });
      if (res) {
        setContractorLicense(res);
        if (res.last_version && res.last_version.remark) {
          setLastVersionId(res.last_version.id);
          setRemark(res.last_version.remark);
        }
      } else {
        console.warn('回傳結果為 undefined');
      }
    } catch (error) {
      console.error('$_fetchContractLicense error:', error);
    }
  };

  const $_updateRemark = async () => {
    const _res = await S_ContractorLicenseVersion.remarkUpdate({
      id: lastVersionId,
      remark: remark
    })
    setRemark(_res.remark)
  }

  // Storage
  const $_setStorage = async value => {
    // console.log('$_setStorage');
    const _data = {
      ...value.last_version,
      ...value,
      contractor_license_template: value.license_template
        ? value.license_template
        : null,
      license_template: value.license_template ? value.license_template : null,
      agent_text: value.last_version?.agent_text
        ? value.last_version?.agent_text
        : null,
      taker_text: value.last_version?.taker_text
        ? value.last_version?.taker_text
        : null
    }
    const _value = JSON.stringify(_data)
    await AsyncStorage.setItem('ContractorsLicenseEdit', _value)
    await AsyncStorage.setItem('ContractorsLicenseUpdate', _value)
  }

  // Function
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }
  const $_licenseState = (date) => {
    const _licenseState = S_ContractorLicense.getLicenseStatus({
      nowDate: moment(new Date()),
      endDate: moment(date),
    })
    return _licenseState
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: t('承攬商資格證'),
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
          name: 'ContractorsLicenseEdit',
          params: {
            id: id,
            modelId: id
          }
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯資格證')
      },
      {
        to: {
          name: 'ContractorsLicenseUpdate',
          params: {
            id: id,
            modelId: id
          }
        },
        icon: 'md-update',
        labelColor: $color.primary,
        label: t('更新資格證')
      },
      {
        onPress: () => {
          setDialogVisible(true)
        },
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除資格證')
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
      $_fetchContractLicense()
    }
  }, [id])

  React.useEffect(() => {
    $_setBottomSheet()
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    if (contractorLicense) {
      $_setStorage(contractorLicense)
    }
  }, [contractorLicense])

  // console.log(JSON.stringify(contractorLicense),'contractorLicense111');

  return (
    <>
      <ScrollView>
        {contractorLicense && (
          <>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}
            >
              <WsText size={24}>{contractorLicense.name}</WsText>

              {contractorLicense.last_version && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginBottom: 16
                  }}>
                  {contractorLicense.last_version?.updated_user?.avatar && (
                    <WsAvatar
                      size={40}
                      source={contractorLicense.last_version?.updated_user?.avatar}
                    />
                  )}
                  {contractorLicense.last_version?.updated_user?.name &&
                    contractorLicense.last_version?.updated_at && (
                      <View
                        style={{
                          marginLeft: 8
                        }}>
                        <WsText color={$color.gray}>
                          {t(contractorLicense.last_version?.updated_user?.name)}
                        </WsText>
                        <WsText color={$color.gray}>
                          {t('編輯時間')}{' '}
                          {moment(contractorLicense.last_version?.updated_at).format(
                            'YYYY-MM-DD HH:MM'
                          )}
                        </WsText>
                      </View>
                    )
                  }
                </View>
              )}

              {contractorLicense.last_version &&
                contractorLicense.last_version?.image && (
                  <>
                    <View
                      style={{
                        flex: 1,
                        margin: 8
                      }}>
                      <WsInfoImage
                        height={200}
                        width={windowWidth}
                        value={contractorLicense.last_version?.image}
                      />
                    </View>
                  </>
                )}
              {contractorLicense.last_version &&
                contractorLicense.last_version?.file_image &&
                contractorLicense.last_version?.file_image[0]?.file &&
                contractorLicense.last_version?.file_image[0]?.file.source_url && (
                  <>
                    <View
                      style={{
                        flex: 1,
                        margin: 8
                      }}>
                      <WsInfoImage
                        height={200}
                        width={windowWidth}
                        value={contractorLicense.last_version?.file_image[0].file.source_url}
                      />
                    </View>
                  </>
                )}
            </WsPaddingContainer>

            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}>

              {contractorLicense.system_subclasses &&
                contractorLicense.system_subclasses.length > 0 && (
                  <WsFlex
                    style={{
                    }}
                  >
                    <WsText size={14} fontWeight={600} style={{ marginRight: 8, width: 160 }}>{t('領域')}</WsText>
                    <WsFlex>
                      {contractorLicense.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
                        return (
                          <WsTag
                            img={systemSubclass.icon}
                            key={systemSubclassIndex}>
                            {t(systemSubclass.name)}
                          </WsTag>
                        )
                      })}
                    </WsFlex>
                  </WsFlex>
                )}

              {contractorLicense.license_template && (
                contractorLicense.license_template.name && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('類型')}
                      value={contractorLicense.license_template && contractorLicense.license_template.name ? contractorLicense.license_template.name : t('其他')}
                    />
                  </View>
                )
              )}

              {contractorLicense.last_version &&
                contractorLicense.last_version?.valid_end_date &&
                ($_licenseState(contractorLicense.last_version?.valid_end_date) === 1 || $_licenseState(contractorLicense.last_version?.valid_end_date) === 2) && (
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsText
                      size={14}
                      fontWeight={600}
                      style={{
                        marginRight: 8,
                        width: 160
                      }}>
                      {t('資格狀態')}
                    </WsText>
                    {contractorLicense.last_version &&
                      contractorLicense.last_version?.valid_end_date &&
                      $_licenseState(contractorLicense.last_version?.valid_end_date) != undefined && (
                        <WsFlex
                          style={{
                          }}
                        >
                          <WsTag
                            backgroundColor={
                              $_licenseState(contractorLicense.last_version?.valid_end_date)
                                ? $color.danger11l
                                : $color.primary11l
                            }
                            textColor={
                              $_licenseState(contractorLicense.last_version?.valid_end_date) == 2 ? $color.danger : $color.primary
                            }>
                            {$_licenseState(contractorLicense.last_version?.valid_end_date) == 2
                              ? t('資格逾期')
                              : $_licenseState(contractorLicense.last_version?.valid_end_date) == 1
                                ? t('資格風險')
                                : t('')}
                          </WsTag>
                        </WsFlex>
                      )}
                  </WsFlex>
                )
              }

              {contractorLicense.contractor &&
                contractorLicense.contractor.name && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('持有人')}
                      value={
                        contractorLicense.contractor &&
                          contractorLicense.contractor.name
                          ? contractorLicense.contractor.name
                          : t('無')
                      }
                    />
                  </View>
                )
              }

              {contractorLicense.last_version &&
                contractorLicense.last_version?.approval_letter && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('核准函號')}
                      value={contractorLicense.last_version?.approval_letter}
                    />
                  </View>
                )
              }

              {contractorLicense.last_version &&
                contractorLicense.last_version?.license_number && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('證號')}
                      value={contractorLicense.last_version?.license_number}
                    />
                  </View>
                )}

              {contractorLicense.last_version &&
                contractorLicense.last_version?.valid_start_date &&
                contractorLicense.last_version?.valid_end_date && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('有效起迄')}
                      value={`${moment(contractorLicense.last_version?.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(contractorLicense.last_version?.valid_end_date).format('YYYY-MM-DD')}`}
                    />
                  </View>
                )}

              {contractorLicense.last_version &&
                contractorLicense.last_version?.valid_start_date &&
                contractorLicense.last_version?.valid_end_date == undefined && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('有效起迄')}
                      value={`${moment(contractorLicense.last_version?.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}`}
                    />
                  </View>
                )}

              {contractorLicense.last_version &&
                contractorLicense.last_version?.remind_date && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      icon={'ws-outline-reminder'}
                      textColor={$color.primary}
                      label={t('提醒確認效期更新')}
                      value={
                        contractorLicense.last_version?.remind_date
                          ? moment(contractorLicense.last_version?.remind_date).format(
                            'YYYY-MM-DD'
                          )
                          : t('未設定')
                      }
                    />
                  </View>
                )
              }

              {contractorLicense.last_version &&
                contractorLicense.last_version?.updated_user && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      labelWidth={160}
                      label={t('管理者')}
                      type="user"
                      value={
                        contractorLicense.last_version?.updated_user
                          ? contractorLicense.last_version?.updated_user
                          : t('無')
                      }
                      isUri={true}
                    />
                  </View>
                )
              }
            </WsPaddingContainer>

            {contractorLicense.last_version &&
              contractorLicense.last_version?.remark &&
              !remarkInput && (
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    marginTop: 8
                  }}>
                  <WsFlex
                    style={{
                      // borderWidth:1,
                    }}
                    justifyContent={'space-between'}
                  >
                    <WsInfo
                      label={i18next.t('備註')}
                      value={
                        remark
                          ? remark
                          : i18next.t('無')
                      }
                    />
                    <LlBtn002
                      minHeight={0}
                      style={{
                      }}
                      onPress={() => setRemarkInput(true)}
                    >
                      {t('編輯')}
                    </LlBtn002>
                  </WsFlex>

                  {contractorLicense.last_version &&
                    contractorLicense.last_version?.remark &&
                    contractorLicense.last_version?.remark_updated_at && (
                      <WsFlex flexWrap={'wrap'}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 8,
                            marginRight: 8
                          }}>
                          <WsIcon
                            name="md-access-time"
                            size={28}
                            color={$color.gray}
                            style={{ marginRight: 4 }}
                          />
                          <WsText color={$color.gray}>
                            {contractorLicense.last_version &&
                              contractorLicense.last_version?.remark &&
                              contractorLicense.last_version?.remark_updated_at && (
                                <>
                                  {i18next.t('編輯時間 ')}
                                  {moment(contractorLicense.last_version?.remark_updated_at).format(
                                    'YYYY-MM-DD HH:mm'
                                  )}
                                </>
                              )}
                          </WsText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 8
                          }}>
                          {contractorLicense.last_version &&
                            contractorLicense.last_version?.remark_updated_user &&
                            contractorLicense.last_version?.remark_updated_user.avatar && (
                              <WsAvatar
                                style={{
                                  marginRight: 4
                                }}
                                size={28}
                                source={
                                  contractorLicense.last_version?.remark_updated_user.avatar
                                }
                              />
                            )
                          }
                          <WsText color={$color.gray}>
                            {contractorLicense.last_version &&
                              contractorLicense.last_version?.remark &&
                              contractorLicense.last_version?.remark_updated_user
                              ? contractorLicense.last_version?.remark_updated_user.name
                              : i18next.t('無')}
                          </WsText>
                        </View>
                      </WsFlex>
                    )}
                </WsPaddingContainer>
              )
            }

            {remarkInput && (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsFlex
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    zIndex: 999
                  }}
                >
                  <LlBtn002
                    minHeight={0}
                    style={{
                      width: 62,
                      marginRight: 4
                    }}
                    onPress={() => {
                      setRemarkInput(false)
                    }}
                  >
                    {t('取消')}
                  </LlBtn002>
                  <LlBtn002
                    minHeight={0}
                    bgColor={$color.primary}
                    textColor={$color.white}
                    borderColor={$color.primary10l}
                    borderWidth={0}
                    style={{
                      width: 62,
                    }}
                    onPress={() => {
                      setRemarkInput(false)
                      $_updateRemark()
                    }}
                  >
                    {t('儲存')}
                  </LlBtn002>
                </WsFlex>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <WsState
                    style={{
                      marginTop: 8,
                    }}
                    label={i18next.t('編輯')}
                    multiline={true}
                    value={remark ? remark : ''}
                    onChange={$event => {
                      if (!$event) {
                        setRemark('')
                      } else {
                        setRemark($event)
                      }
                    }}
                    placeholder={i18next.t('輸入')}
                  />
                </TouchableWithoutFeedback>
              </WsPaddingContainer>
            )}

            {contractorLicense.last_version?.file_attaches &&
              contractorLicense.last_version?.file_attaches.length > 0 && (
                <WsPaddingContainer
                  style={{
                    marginTop: 8
                  }}>
                  <WsInfo
                    type="filesAndImages"
                    label={t('附件')}
                    value={contractorLicense.last_version?.file_attaches}
                  />
                </WsPaddingContainer>
              )}

            {contractorLicense &&
              contractorLicense.license_template &&
              ((
                contractorLicense.license_template &&
                contractorLicense.license_template.last_version &&
                contractorLicense.license_template.last_version?.article_versions &&
                contractorLicense.license_template.last_version?.article_versions.length != 0
              ) || (
                  contractorLicense.license_template &&
                  contractorLicense.license_template.last_version &&
                  contractorLicense.license_template.last_version?.act_version_alls &&
                  contractorLicense.license_template.last_version?.act_version_alls.length != 0
                )) && (
                <LlInfoContainer001
                  style={{
                    marginTop: 8
                  }}>
                  <View
                    style={{
                      flexDirection: 'row'
                    }}>
                    <WsIcon
                      name={'ll-nav-law-outline'}
                      size={24}
                      style={{
                        marginRight: 8,
                      }}
                    />
                    <WsText size={14} fontWeight={'600'}>
                      {t('法規依據')}
                    </WsText>
                  </View>
                  {contractorLicense.license_template &&
                    contractorLicense.license_template.last_version &&
                    contractorLicense.license_template.last_version?.act_version_alls &&
                    contractorLicense.license_template.last_version?.act_version_alls.length != 0 && (
                      <>
                        {contractorLicense.license_template.last_version?.act_version_alls.map(
                          (article, articleIndex) => {
                            return (
                              <WsInfo
                                style={{
                                  marginTop: 8
                                }}
                                type="link"
                                value={
                                  article.name
                                }
                                onPress={() => {
                                  navigation.push('RoutesAct', {
                                    screen: 'ActShow',
                                    params: {
                                      id: article.act.id,
                                    }
                                  })
                                }}
                              />
                            )
                          }
                        )}
                      </>
                    )}
                  {contractorLicense.license_template &&
                    contractorLicense.license_template.last_version &&
                    contractorLicense.license_template.last_version?.article_versions &&
                    contractorLicense.license_template.last_version?.article_versions.length != 0 && (
                      <>
                        {contractorLicense.license_template.last_version?.article_versions.map(
                          (article, articleIndex) => {
                            return (
                              <>
                                <TouchableOpacity
                                  key={articleIndex}
                                  onPress={() => {
                                    setStateModal(true)
                                    setSelectVersionId(article.id)
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'flex-start',
                                      alignItems: 'center',
                                    }}>
                                    <WsInfo
                                      type="link"
                                      value={$_setArticleText(article)}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 4,
                                      }}
                                      onPress={() => {
                                        setStateModal(true)
                                        setSelectVersionId(article.id)
                                      }}
                                    />
                                  </View>
                                </TouchableOpacity>
                              </>
                            )
                          }
                        )}
                      </>
                    )}
                </LlInfoContainer001>
              )}

            {contractorLicense.license_template &&
              contractorLicense.license_template.last_version &&
              contractorLicense.license_template.last_version?.precautions && (
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    marginTop: 8
                  }}>
                  <WsFlex
                    style={{
                      // borderWidth:1,
                    }}
                    justifyContent={'space-between'}
                  >
                    <WsInfo
                      label={i18next.t('備註')}
                      value={
                        contractorLicense.license_template.last_version?.precautions
                          ? contractorLicense.license_template.last_version?.precautions
                          : i18next.t('無')
                      }
                    />
                  </WsFlex>
                </WsPaddingContainer>
              )}

            {contractorLicense.license_template &&
              contractorLicense.license_template.last_version &&
              contractorLicense.license_template.last_version?.expired_comment && (
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    marginTop: 8
                  }}>
                  <WsFlex
                    style={{
                      // borderWidth:1,
                    }}
                    justifyContent={'space-between'}
                  >
                    <WsInfo
                      label={i18next.t('效期說明')}
                      value={
                        contractorLicense.license_template.last_version?.expired_comment
                          ? contractorLicense.license_template.last_version?.expired_comment
                          : i18next.t('無')
                      }
                    />
                  </WsFlex>
                </WsPaddingContainer>
              )}
          </>
        )}

        {contractorLicense?.versions?.length > 1 && (
          <WsPaddingContainer
            style={{
              marginTop: 8,
              backgroundColor: $color.primary11l
            }}>
            <LlBtn002
              onPress={() => {
                setStateModal002(true)
              }}>
              {t('查看歷史版本')}
            </LlBtn002>
          </WsPaddingContainer>
        )}

        <WsModal
          title={contractorLicense?.name ? `${t('證照歷史記錄')}-\n${contractorLicense?.name}` : t('證照歷史記錄')}
          visible={stateModal002}
          headerLeftOnPress={() => {
            setStateModal002(false)
          }}
          onBackButtonPress={() => {
            setStateModal002(false)
          }}>
          <WsVersionHistory
            licenseName={contractorLicense?.name}
            versionId={contractorLicense?.last_version?.id}

            modelName="contractor_license_version"
            nameKey={'updated_at'}
            formatNameKey={'YYYY-MM-DD'}
            params={{
              contractor_license: contractorLicense?.id,
              factory: currentFactory?.id
            }}
          />
        </WsModal>

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
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
      <WsDialogDelete
        id={id}
        to="ContractorsShow"
        toParams={contractorLicense ? contractorLicense.contractor?.id : ''}
        modelName="contractor_license"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}
export default ContractorsLicenseShow
