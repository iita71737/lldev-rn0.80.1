import React, { useState, useEffect } from 'react'
import {
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import {
  WsBtn,
  WsPaddingContainer,
  WsTitle,
  WsInfoUser,
  WsFlex,
  WsInfo,
  WsText,
  WsTabView,
  WsTag,
  WsModal,
  LlRiskHeaderCalc,
  LlEffectWithAuditRisk,
  LlNavButton002,
  WsIconBtn,
  WsTabView002,
  WsState
} from '@/components'
import LlAuditResultCard from '@/components/LlAuditResultCard'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import AuditChaptersSort from '@/sections/Audit/AuditChaptersSort'
import AuditRecordsSort from '@/sections/Audit/AuditRecordsSort'
import { useSelector } from 'react-redux'
import AuditResultOverview from '@/sections/Audit/AuditResultOverview'

const AuditRecordShow = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const { id, editable = true, from } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const effects = useSelector(state => state.data.effects)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [refreshCounter, setRefreshCounter] = React.useState(1);

  const [auditRecord, setAuditRecord] = useState()
  const [auditRecordFormatted, setAuditRecordFormatted] = useState(null)

  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()
  const [remarkAttaches, setRemarkAttaches] = React.useState()

  const [stateModal, setStateModal] = React.useState(false)
  const [tabIndex, settabIndex] = React.useState(0)
  const [answers, setAnswers] = useState([])

  // TabView
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'AuditResultOverview',
      label: t('總覽'),
      view: AuditResultOverview,
      props: {
        id: id
      }
    },
    {
      value: 'AuditRecordsSort',
      label: t('依結果排序'),
      view: AuditRecordsSort,
      props: {
        id: id,
        navigation: navigation,
      }
    },
    {
      value: 'AuditChaptersSort',
      label: t('依章節排序'),
      view: AuditChaptersSort,
      props: {
        id: id,
        navigation: navigation
      }
    }
  ])

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'AuditResultOverview',
        label: t('總覽'),
        view: AuditResultOverview,
        props: {
          id: id,
          refreshCounter: refreshCounter
        }
      },
      {
        value: 'AuditRecordsSort',
        label: t('依結果排序'),
        view: AuditRecordsSort,
        props: {
          id: id,
          navigation: navigation,
          auditRecord: auditRecord
        }
      },
      {
        value: 'AuditChaptersSort',
        label: t('依章節排序'),
        view: AuditChaptersSort,
        props: {
          id: id,
          navigation: navigation,
          auditRecord: auditRecord
        }
      }
    ])
  }

  // Service
  const $_fetchAuditRecords = async () => {
    const res = await S_AuditRecord.show({
      modelId: id
    })
    setAuditRecord(res)
    const dateKeyFormat = await S_AuditRecord.getFormatted(res)
    setAuditRecordFormatted(dateKeyFormat)
    setRemark(dateKeyFormat.review_remark)
    setRemarkImages(dateKeyFormat.review_images)
    setRemarkAttaches(dateKeyFormat.review_attaches)
  }
  const $_fetchAuditAnswers = async () => {
    const res = await S_AuditRecordAns.index({ parentId: id })
    setAnswers(res.data)
  }
  const $_onSubmit = async () => {
    const _params = {
      review_remark: remark,
      review_images: remarkImages ? S_AuditRecord.formattedForFileStore(remarkImages) : [],
      review_attaches: remarkAttaches ? S_AuditRecord.formattedForFileStore(remarkAttaches) : [],
    }
    try {
      const _remark = await S_AuditRecord.updateReviewRemark({
        modelId: id,
        data: _params
      })
      setRemark(_remark.review_remark)
      setRefreshCounter(refreshCounter + 1)
    } catch (e) {
      console.error(e);
    }
  }

  // HELPER
  const $_checkReviewAvailable = () => {
    if (auditRecordFormatted &&
      auditRecordFormatted.auditees &&
      currentUser) {
      const canReplyAudit = auditRecordFormatted.auditees.some(item => item.id === currentUser.id);
      return canReplyAudit
    }
  }

  const $_setNavigationOption = async () => {
    if (!auditRecordFormatted) {
      return
    }
    navigation.setOptions({
      title: t('稽核結果')
    })
    navigation.setOptions({
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
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
    if (from) {
      $_setNavigationOption()
    }
  }, [from])

  useEffect(() => {
    $_fetchAuditRecords()
  }, [])

  useEffect(() => {
    $_setNavigationOption()
    $_fetchAuditAnswers()
  }, [auditRecordFormatted])

  React.useEffect(() => {
    if (auditRecord) {
      $_setTabItems()
    }
  }, [auditRecord, refreshCounter])

  // Render
  return (
    <>
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        {auditRecordFormatted && answers.length != 0 && (
          <>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsFlex justifyContent="space-between" alignItems="flex-start">
                <WsText
                  style={{
                    flex: 1
                  }}
                  size={24}>
                  {auditRecordFormatted && auditRecordFormatted.title ? auditRecordFormatted.title : ''}
                </WsText>
                {/* {templateVersion < lastTemplateVersion && (
                    <WsTag
                      backgroundColor="rgb(255, 247, 208)"
                      textColor={$color.gray6d}>
                      {t('版本更新')}
                    </WsTag>
                  )} */}
              </WsFlex>
              <WsFlex
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                }}>
                {auditRecordFormatted.systemSubclasses.map(
                  (systemSubclass, systemSubclassIndex) => {
                    return (
                      <WsTag
                        key={systemSubclassIndex}
                        style={{
                          marginTop: 16,
                          marginRight: 8
                        }}
                        img={systemSubclass.icon}>
                        {t(systemSubclass.name)}
                      </WsTag>
                    )
                  }
                )}
              </WsFlex>
            </WsPaddingContainer>

            <WsTabView
              isAutoWidth={true}
              index={tabIndex}
              setIndex={settabIndex}
              items={tabItems}
              scrollEnabled={false}
            />

            {$_checkReviewAvailable() && (
              <WsBtn
                onPress={() => {
                  setStateModal(true)
                }}>
                {remark ? t('修改稽核回覆') : t('受稽者尚未填寫回覆')}
              </WsBtn>
            )}

            <WsModal
              visible={stateModal}
              onBackButtonPress={() => {
                setStateModal(false)
              }}
              headerLeftOnPress={() => {
                setStateModal(false)
              }}
              headerRightText={t('儲存')}
              headerRightOnPress={() => {
                $_onSubmit()
                setStateModal(false)
              }}
              animationType="slide"
            >
              <KeyboardAvoidingView
                style={{
                  flex: 1,
                }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                enabled
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <WsState
                      label={t('回覆稽核')}
                      labelIcon={'ws-outline-edit-pencil'}
                      autoFocus={true}
                      multiline={true}
                      style={{
                        paddingTop: 16,
                        paddingHorizontal: 16,
                      }}
                      placeholder={t('輸入')}
                      value={remark}
                      onChange={setRemark}
                    />
                    <WsState
                      style={{
                        marginTop: 16,
                        paddingHorizontal: 16
                      }}
                      type="Ll_filesAndImages"
                      label={t('上傳')}
                      labelIcon={'md-photo'}
                      value={remarkImages}
                      onChange={setRemarkImages}
                      modelName="audit_record"
                    />
                    <WsState
                      style={{
                        marginTop: 16,
                        paddingHorizontal: 16
                      }}
                      type="Ll_filesAndImages"
                      label={t('上傳')}
                      labelIcon={'ws-outline-attachment'}
                      value={remarkAttaches}
                      onChange={setRemarkAttaches}
                      modelName="audit_record"
                    />
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </WsModal>
          </>
        )}
      </SafeAreaView>
    </>
  )
}

export default AuditRecordShow
