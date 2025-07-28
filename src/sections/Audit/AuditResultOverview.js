import React, { useState, useEffect } from 'react'
import { ScrollView, TouchableOpacity, View, TextInput, SafeAreaView, Dimensions } from 'react-native'
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
  WsIconBtn
} from '@/components'
import LlAuditResultCard from '@/components/LlAuditResultCard'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import AuditChaptersSort from '@/sections/Audit/AuditChaptersSort'
import AuditRecordsSort from '@/sections/Audit/AuditRecordsSort'
import { useSelector } from 'react-redux'
import AuditResultOverview from '@/sections/Audit/AuditResultOverview'

const AuditRecordShow = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const {
    id,
    name,
    // editable = true, 
    from,

    refreshCounter
  } = props

  // Redux
  const effects = useSelector(state => state.data.effects)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [auditRecord, setAuditRecord] = useState()
  const [auditRecordFormatted, setAuditRecordFormatted] = useState(null)
  const [reviewEdited, setReviewEdited] = React.useState(false)

  const [remark, setRemark] = React.useState()
  const [remarkAttaches, setRemarkAttaches] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()

  const [stateModal, setStateModal] = React.useState(false)
  const [answers, setAnswers] = useState([])

  // Service
  const $_fetchAuditRecords = async () => {
    const res = await S_AuditRecord.show({
      modelId: id
    })
    setAuditRecord(res)
    const dateKeyFormat = await S_AuditRecord.getFormatted(res)
    setAuditRecordFormatted(dateKeyFormat)
    setRemark(dateKeyFormat.review_remark)
    setRemarkAttaches(dateKeyFormat.review_attaches)
    setRemarkImages(dateKeyFormat.review_images)
  }

  const $_fetchAuditAnswers = async () => {
    const res = await S_AuditRecordAns.index({ parentId: id })
    setAnswers(res.data)
  }

  useEffect(() => {
    $_fetchAuditRecords()
  }, [refreshCounter])

  useEffect(() => {
    $_fetchAuditAnswers()
  }, [auditRecordFormatted])

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
            <ScrollView
              testID={'ScrollView'}
              style={{
              }}
            >
              <LlRiskHeaderCalc answers={answers} type={"audit"} />
              <LlEffectWithAuditRisk answers={answers} />
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginBottom: 8
                }}
              >
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('稽核總評')}
                    value={auditRecordFormatted.record_remark}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexWrap: 'wrap',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('稽核者')}
                    value={auditRecordFormatted.auditors}
                    type="users"
                    isUri={true}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('稽核時間')}
                    value={auditRecordFormatted.record_at}
                    type="dateTime"
                    isUri={true}
                  />
                </View>
                {auditRecordFormatted &&
                  auditRecordFormatted.images &&
                  auditRecordFormatted.images.length > 0 && (
                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={100}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                        type="files"
                        label={t('附件')}
                        value={auditRecordFormatted.images}
                      />
                    </View>
                  )}
                {auditRecordFormatted &&
                  auditRecordFormatted.file_images &&
                  auditRecordFormatted.file_images.length > 0 && (

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={100}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                        type="filesAndImages"
                        label={t('附件')}
                        value={auditRecordFormatted.file_images}
                      />
                    </View>
                  )}
              </WsPaddingContainer>

              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                }}
              >
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('回覆稽核')}
                    value={remark ? remark : t('無')}
                  />
                </View>

                <View

                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('受稽者')}
                    value={auditRecordFormatted.auditees}
                    type="users"
                    isUri={true}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('回覆日期')}
                    value={auditRecordFormatted.review_at}
                    type="dateTime"
                    isUri={true}
                  />
                </View>

                {auditRecordFormatted.review_images &&
                  auditRecordFormatted.review_images.length > 0 && (
                    <WsInfo
                      labelWidth={100}
                      style={{
                        top: 8,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                      label={t('相關圖片')}
                      labelColor={$color.gray}
                      type='files'
                      value={auditRecordFormatted.review_images ? auditRecordFormatted.review_images : null}
                    />
                  )}

                {auditRecordFormatted.file_review_images &&
                  auditRecordFormatted.file_review_images.length > 0 && (
                    <WsInfo
                      labelWidth={100}
                      style={{
                        top: 8,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                      label={t('相關圖片')}
                      labelColor={$color.gray}
                      type='filesAndImages'
                      value={auditRecordFormatted.file_review_images ? auditRecordFormatted.file_review_images : null}
                    />
                  )}

                {auditRecordFormatted.review_attaches &&
                  auditRecordFormatted.review_attaches.length > 0 && (
                    <WsInfo
                      labelWidth={100}
                      style={{
                        top: 8,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                      label={t('附件')}
                      labelColor={$color.gray}
                      type='files'
                      value={auditRecordFormatted.review_attaches ? auditRecordFormatted.review_attaches : null}
                    />
                  )}

                {auditRecordFormatted.file_review_attaches &&
                  auditRecordFormatted.file_review_attaches.length > 0 && (
                    <WsInfo
                      labelWidth={100}
                      style={{
                        top: 8,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                      label={t('附件')}
                      labelColor={$color.gray}
                      type='filesAndImages'
                      value={auditRecordFormatted.file_review_attaches ? auditRecordFormatted.file_review_attaches : null}
                    />
                  )}

              </WsPaddingContainer>
              <View
                style={{
                  // borderWidth: 1,
                  height: 50,
                }}
              >
              </View>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </>
  )
}

export default AuditRecordShow
