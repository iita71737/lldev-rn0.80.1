import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Alert } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsIcon,
  WsAvatar,
  WsSkeleton,
  WsTag,
  WsIconBtn,
  LlBtn002,
  LlBtn001,
  WsState,
  LlExitChecklistEnterStatusCardTag
} from '@/components'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useIsFocused } from '@react-navigation/native'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'

const ContractorEnterList = (props) => {
  const isFocused = useIsFocused()
  const { t, i18n } = useTranslation()

  // Props
  const { id, factory, navigation, route } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [contractorEnter, setContractorEnter] = React.useState()

  const [exitCheckItem, setExitCheckItem] = React.useState()
  const [exitCheckItemCopy, setExitCheckItemCopy] = React.useState()
  const [exitCheckItemInput, setExitCheckItemInput] = React.useState(false)
  const [remark, setRemark] = React.useState()
  const [remarkCopy, setRemarkCopy] = React.useState()
  const [remarkInput, setRemarkInput] = React.useState(false)

  // Services
  const $_fetchContractorEnterList = async () => {
    try {
      const res = await S_ContractorEnterRecord.show({ modelId: id })
      setContractorEnter(res)
      setExitCheckItem(res.exit_check_item)
      setRemark(res.remark)
      setLoading(false)
    }
    catch (error) {
      console.error(error)
    }
  }

  // 編輯復歸事項
  const $_updateExitCheckItem = async () => {
    try {
      const _res = await S_ContractorEnterRecord.exitCheckItemUpdate({
        id: id,
        exit_check_item: exitCheckItem
      })
      setContractorEnter(_res)
      setExitCheckItem(_res.exit_check_item)
    } catch (err) {
      console.log(err)
    }
  }

  // 編輯備註
  const $_updateRemark = async () => {
    const _res = await S_ContractorEnterRecord.remarkUpdate({
      id: id,
      remark: remark
    })
    setContractorEnter(_res)
    setRemark(_res.remark)
  }

  React.useEffect(() => {
    $_fetchContractorEnterList()
  }, [])

  useEffect(() => {
    if (isFocused) {
      setLoading(true)
      $_fetchContractorEnterList()
    }
  }, [id, route, isFocused])

  return (
    <>
      {loading ? (
        <>
          <WsSkeleton />
        </>
      ) : (
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
              flex: 1
            }}>
            <ScrollView
              style={{
                flex: 1
              }}
            >
              {contractorEnter && (
                <>
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                      }}>
                      <WsAvatar
                        size={50}
                        source={contractorEnter.creator.avatar}
                      />
                      <View
                        style={{
                          marginLeft: 8
                        }}>
                        <WsText color={$color.gray}>
                          {t(contractorEnter.creator.name)}
                        </WsText>
                        <WsText
                          size={12}
                          color={$color.gray}
                        >
                          {t('編輯時間')}{' '}
                          {moment(contractorEnter.updated_at).format(
                            'YYYY-MM-DD HH:mm'
                          )}
                        </WsText>
                      </View>
                    </View>
                  </WsPaddingContainer>

                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                      marginTop: 8,

                    }}>
                    <WsText size={24}>{t(contractorEnter.task_content)}</WsText>
                  </WsPaddingContainer>

                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                      marginTop: 8
                    }}
                  >

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={i18next.t('承攬商')}
                        value={
                          contractorEnter.contractor
                            ? contractorEnter.contractor.name
                            : i18next.t('無')
                        }
                      />
                    </View>

                    {contractorEnter.enter_start_date &&
                      contractorEnter.enter_end_date &&
                      (contractorEnter.enter_start_date !== contractorEnter.enter_end_date) && (
                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={120}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            label={i18next.t('預計進場日期')}
                            value={`${moment(
                              contractorEnter.enter_start_date
                            ).format('YYYY-MM-DD')} ~ ${moment(
                              contractorEnter.enter_end_date
                            ).format('YYYY-MM-DD')}`}
                          />
                        </View>
                      )}

                    {contractorEnter.enter_start_date &&
                      contractorEnter.enter_end_date &&
                      (contractorEnter.enter_start_date == contractorEnter.enter_end_date) && (
                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={120}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            label={i18next.t('預計進場日期')}
                            value={`${moment(
                              contractorEnter.enter_start_date
                            ).format('YYYY-MM-DD')}`}
                          />
                        </View>
                      )}

                    {contractorEnter.enter_start_date &&
                      !contractorEnter.enter_end_date && (
                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={120}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            label={i18next.t('預計進場日期')}
                            value={`${moment(
                              contractorEnter.enter_start_date
                            ).format('YYYY-MM-DD')}`}
                          />
                        </View>
                      )}

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={i18next.t('預計進場時間')}
                        value={`${moment(contractorEnter.enter_start_time).format(
                          'HH:mm'
                        )} ~ ${moment(contractorEnter.enter_end_time).format(
                          'HH:mm'
                        )}`}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={i18next.t('作業地點')}
                        value={contractorEnter.operate_location}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={i18next.t('作業內容')}
                        value={contractorEnter.task_content}
                      />
                    </View>

                    <WsFlex
                      style={{
                        marginTop: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <WsText size={14} fontWeight={'600'} style={{ width: 128 }}>
                        {t('領域')}
                      </WsText>
                      <WsFlex
                        flexWrap={'wrap'}
                        style={{
                        }}>
                        {
                          contractorEnter.system_subclasses &&
                          contractorEnter.system_subclasses.map(
                            (subClass, subClassIndex) => {
                              return (
                                <WsTag
                                  key={`subClass${subClassIndex}`}
                                  img={subClass.icon}
                                  style={{ marginRight: 8, marginTop: 4 }}>
                                  {t(subClass.name)}
                                </WsTag>
                              )
                            }
                          )}
                      </WsFlex>
                    </WsFlex>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={i18next.t('負責人')}
                        type="user"
                        value={contractorEnter.owner}
                        isUri={true}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        textColor={$color.primary}
                        icon={'ws-outline-reminder'}
                        label={i18next.t('提醒日期')}
                        value={
                          contractorEnter.notify_at
                            ? moment(contractorEnter.notify_at).format('YYYY-MM-DD')
                            : i18next.t('未設定')
                        }
                      />
                    </View>

                    <LlExitChecklistEnterStatusCardTag
                      contractorEnter={contractorEnter}
                    >
                    </LlExitChecklistEnterStatusCardTag>
                  </WsPaddingContainer>

                  {contractorEnter.exit_check_item && !exitCheckItemInput && (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8
                      }}>
                      <WsFlex
                        style={{
                        }}
                        justifyContent={'space-between'}
                      >
                        <WsInfo
                          label={i18next.t('復歸事項')}
                          style={{
                          }}
                          value={
                            exitCheckItem
                              ? exitCheckItem
                              : i18next.t('無')
                          }
                        />
                        {/* https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1716 */}
                        {contractorEnter.enter_status !== 'complete' || contractorEnter.enter_status !== 'suspend' && (
                          <LlBtn002
                            minHeight={0}
                            style={{
                              width: 62,
                              position: 'absolute',
                              top: 0,
                              right: 0,
                            }}
                            onPress={() => {
                              setExitCheckItemCopy(exitCheckItem)
                              setExitCheckItemInput(true)
                            }
                            }
                          >
                            {t('編輯')}
                          </LlBtn002>
                        )}
                      </WsFlex>
                      {contractorEnter.exit_check_item_updated_at && (
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
                              size={20}
                              color={$color.gray}
                              style={{ marginRight: 4 }}
                            />
                            <WsText color={$color.gray} size={12}>
                              <>
                                {i18next.t('編輯時間')}
                                {moment(contractorEnter.exit_check_item_updated_at).format('YYYY-MM-DD HH:mm')}
                              </>
                            </WsText>
                          </View>
                          {contractorEnter.exit_check_item_updated_user && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}>

                              {contractorEnter.exit_check_item_updated_user.avatar && (
                                <WsAvatar
                                  style={{
                                    marginRight: 4
                                  }}
                                  size={24}
                                  source={
                                    contractorEnter.exit_check_item_updated_user.avatar
                                  }
                                />
                              )}

                              <WsText color={$color.gray} size={14}>
                                {contractorEnter.exit_check_item_updated_user
                                  ? contractorEnter.exit_check_item_updated_user.name
                                  : i18next.t('無')}
                              </WsText>
                            </View>
                          )}
                        </WsFlex>
                      )
                      }
                    </WsPaddingContainer>
                  )}

                  {exitCheckItemInput && (
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
                            setExitCheckItem(exitCheckItemCopy)
                            setExitCheckItemInput(false)
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
                            setExitCheckItemInput(false)
                            $_updateExitCheckItem()
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
                          label={i18next.t('編輯復歸事項')}
                          multiline={true}
                          value={exitCheckItem ? exitCheckItem : ''}
                          onChange={$event => {
                            if (!$event) {
                              setExitCheckItem('')
                            } else {
                              setExitCheckItem($event)
                            }
                          }}
                          placeholder={i18next.t('編輯復歸事項')}
                        />
                      </TouchableWithoutFeedback>

                    </WsPaddingContainer>
                  )}

                  {contractorEnter.remark && !remarkInput && (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8
                      }}>

                      <WsFlex
                        style={{
                        }}
                        justifyContent={'space-between'}
                      >
                        <WsInfo
                          label={i18next.t('備註')}
                          style={{
                          }}
                          value={
                            remark
                              ? remark
                              : i18next.t('無')
                          }
                        />
                        {contractorEnter.enter_status !== 'complete' || contractorEnter.enter_status !== 'suspend' && (
                          <LlBtn002
                            minHeight={0}
                            style={{
                              width: 62,
                              position: 'absolute',
                              top: 0,
                              right: 0,
                            }}
                            onPress={() => {
                              setRemarkCopy(remark)
                              setRemarkInput(true)
                            }}
                          >
                            {t('編輯')}
                          </LlBtn002>
                        )}
                      </WsFlex>

                      {contractorEnter.remark && contractorEnter.remark_updated_at && (
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
                              size={24}
                              color={$color.gray}
                              style={{ marginRight: 4 }}
                            />
                            <WsText color={$color.gray} size={14}>
                              {contractorEnter.remark &&
                                contractorEnter.remark_updated_at ? (
                                <>
                                  {i18next.t('編輯時間')}
                                  {moment(contractorEnter.remark_updated_at).format('YYYY-MM-DD HH:mm')}
                                </>
                              ) : (
                                i18next.t('尚無編輯記錄...')
                              )}
                            </WsText>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginVertical: 8
                            }}>
                            {contractorEnter.exit_check_item_updated_user && contractorEnter.exit_check_item_updated_user.avatar && (
                              <WsAvatar
                                style={{
                                  marginRight: 4
                                }}
                                size={18}
                                source={
                                  contractorEnter.exit_check_item_updated_user.avatar
                                }
                              />
                            )
                            }

                            <WsText color={$color.gray} size={14}>
                              {contractorEnter.remark &&
                                contractorEnter.remark_updated_user
                                ? contractorEnter.remark_updated_user.name
                                : i18next.t('無')}
                            </WsText>
                          </View>
                        </WsFlex>
                      )}
                    </WsPaddingContainer>
                  )}

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
                            setRemark(remarkCopy)
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
                          label={i18next.t('編輯復歸事項')}
                          multiline={true}
                          value={remark ? remark : ''}
                          onChange={$event => {
                            if (!$event) {
                              setRemark('')
                            } else {
                              setRemark($event)
                            }
                          }}
                          placeholder={i18next.t('編輯復歸事項')}
                        />
                      </TouchableWithoutFeedback>
                    </WsPaddingContainer>
                  )}

                  {contractorEnter.file_attaches &&
                    contractorEnter.file_attaches.length > 0 && (
                      <WsPaddingContainer>
                        <WsInfo
                          type="filesAndImages"
                          label={i18next.t('附件')}
                          value={contractorEnter.file_attaches}
                        />
                      </WsPaddingContainer>
                    )}
                </>
              )}
              <View
                style={{
                  height: 150
                }}
              >
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}
    </>
  )
}
export default ContractorEnterList
