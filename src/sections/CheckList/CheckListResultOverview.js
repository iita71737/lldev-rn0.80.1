import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView
} from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsInfoUser,
  WsModal,
  LlRiskHeaderCalc,
  LlEffectWithAuditRisk,
  LlEffectWithCheckList,
  WsState,
  WsGradientButton,
  WsInfo,
  WsEmpty,
  WsTag,
  WsIconBtn,
  WsAvatar,
  WsDes
} from '@/components'
import { useTranslation } from 'react-i18next'

import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import S_GeneralRecord from '@/services/api/v1/general_record'
import S_ConstantData from '@/services/api/v1/constant_data'
import { WsSkeleton } from '@/components'

const CheckListResultOverview = (props) => {
  const { t, i18n } = useTranslation()

  // Params
  const {
    id,
    refreshCounter,

    setIsBottomSheetActive,
    setSelectedId,
    setSelectedMode,

    setReviewContent,
    setReviewScore,
    setReviewUploadFileURL,
    setReviewUploadFileURLIds,

    setSampleContent,
    setSampleScore,
    setSampleUploadFileURL,
  } = props

  // Redux
  const currentConstantData = useSelector(state => state.stone_auth.constantData)
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUserScope = useSelector(state => state.data.userScopes)

  // State
  const [answers, setAnswers] = React.useState()
  const [record, setRecord] = React.useState()

  // Services
  const $_fetchRecord = async () => {
    const res = await S_CheckListRecord.showV2({ modelId: id })
    if (!res) {
      return
    }
    setRecord(res)
    if (res && res.checklist_review_records && res.checklist_review_records.length > 0) {
      const _defaultContent = res.checklist_review_records.find(item => {
        if (!item.recorder) {
          return
        }
        return item.recorder.id == currentUser.id;
      });
      if (_defaultContent) {
        setSampleContent(_defaultContent.content)
        setSampleScore(_defaultContent.score)
      }
    }
  }

  const $_fetchAnswers = async () => {
    const res = await S_CheckListRecordAns.indexV2({ parentId: id })
    if (res.data) {
      setAnswers(res.data)
    }
  }

  React.useEffect(() => {
    $_fetchRecord()
    $_fetchAnswers()
  }, [id, refreshCounter])

  return (
    <>
      <ScrollView
        testID={'ScrollView'}
      >
        {record && answers ? (
          <>
            <LlRiskHeaderCalc
              record={record}
            />
            <LlEffectWithCheckList
              payload={record.level_payload}
              effect={record.effect_payload}
              keypoint={record.keypoint_payload}
            />

            {record.status &&
              record.status == 1 && (
                <WsPaddingContainer
                  backgroundColor={$color.primary11l}
                >
                  <WsInfo
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    labelWidth={120}
                    type="users"
                    label={t('答題者')}
                    labelSize={14}
                    isUri={true}
                    value={record.checkers}
                  />
                  <WsInfo
                    labelWidth={120}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                    label={t('不需點檢原因')}
                    value={record.remark ? record.remark : t('')}
                  />
                </WsPaddingContainer>
              )}

            {record.updated_user && (
              <WsPaddingContainer
                style={{
                  marginTop: 16,
                  backgroundColor: $color.white,
                }}>
                <WsFlex
                  style={{
                    marginBottom: 8,
                    // borderWidth: 1,
                  }}
                >
                  <WsText
                    size={14}
                    fontWeight={600}
                    style={{
                      width: 108
                    }}
                  >
                    {t('答題者')}
                  </WsText>
                  <WsFlex>
                    <WsAvatar
                      size={30}
                      isUri={true}
                      source={record.updated_user.avatar ? record.updated_user.avatar : null}
                      style={{
                      }}
                    />
                    <View>
                      <WsFlex>
                        <WsText
                          size={12}
                          style={{
                            paddingHorizontal: 4
                          }}
                        >
                          {record.updated_user.name}
                        </WsText>
                        {record.record_at && (
                          <WsTag>
                            {t('已完成')}
                          </WsTag>
                        )}
                      </WsFlex>
                      {record.record_at &&
                        (
                          <WsDes
                            style={{
                              paddingLeft: 4
                            }}
                          >
                            {
                              record.record_at ?
                                moment(record.record_at).format('YYYY-MM-DD HH:mm') :
                                null
                            }
                          </WsDes>
                        )}
                    </View>
                  </WsFlex>
                </WsFlex>
              </WsPaddingContainer>
            )}

            {record.status != 1 && (
              <WsPaddingContainer
                padding={0}
                style={{
                  marginTop:16,
                  paddingTop: 16,
                  paddingHorizontal: 16,
                  backgroundColor: $color.white,
                }}
              >
                <FlatList
                  data={record.checklist_sample_records}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item, index }) => (
                    <>
                      {item.recorder &&
                        currentUser &&
                        item.recorder.id === currentUser.id && (
                          <WsIconBtn
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: index != 0 ? 16 : 16,
                              zIndex: 999
                            }}
                            name="md-more-horiz"
                            padding={0}
                            size={28}
                            onPress={() => {
                              if (item) {
                                setSelectedId(item.id)
                                setSelectedMode('editSample')
                                setSampleContent(item.content)
                                setSampleScore(item.score)
                                setSampleUploadFileURL(item.attaches)
                              }
                              setIsBottomSheetActive(true)
                            }}
                          />
                        )
                      }

                      <View
                        style={{
                          borderBottomWidth: 0.3,
                          paddingTop: index != 0 ? 16 : 16,
                          paddingBottom: 16,
                          // borderWidth:1,
                          borderTopWidth: index === 0 ? 0.3 : 0,
                        }}
                      >
                        <WsFlex>
                          <WsText
                            style={{
                              marginRight: 16,
                              width: 72
                            }}
                            size={14} color={$color.gray}
                            fontWeight={'600'}
                          >
                            {t('結果')}
                          </WsText>
                          <WsTag
                            backgroundColor={item.score == 10 ? $color.green11l : $color.danger11l}
                            iconColor={item.score == 10 ? $color.green : $color.danger}
                            textColor={item.score == 10 ? $color.gray3d : $color.danger}
                            icon={item.score == 10 ? 'ws-filled-check-circle' : "ws-filled-cancel"}
                            borderRadius={16}
                          >
                            {item.score == 10 ? t('通過') : t('不通過')}
                          </WsTag>
                        </WsFlex>

                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={80}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginRight: 16,
                            }}
                            label={t('抽檢者')}
                            labelColor={$color.gray}
                            type={'user'}
                            value={item.recorder ? item.recorder : t('無')}
                          />
                        </View>

                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={80}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginRight: 16,
                            }}
                            label={t('時間')}
                            labelColor={$color.gray}
                            type='dateTime'
                            value={item.record_at ? moment(item.record_at).format('YYYY-MM-DD HH:mm') : t('無')}
                          />
                        </View>

                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={80}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginRight: 16,
                            }}
                            label={t('內容')}
                            labelColor={$color.gray}
                            value={item.content ? item.content : t('抽檢者尚未填寫')}
                          />
                        </View>

                        {item.file_versions &&
                          item.file_versions.length > 0 && (
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={80}
                                label={t('附件')}
                                type="filesAndImages"
                                labelColor={$color.gray}
                                value={item.file_versions}
                                style={{
                                  flexDirection: 'row'
                                }}
                              />
                            </View>
                          )}

                        {item.attaches &&
                          item.attaches.length > 0 && (
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={80}
                                label={t('附件')}
                                type="filesAndImages"
                                labelColor={$color.gray}
                                value={item.attaches}
                                style={{
                                  flexDirection: 'row'
                                }}
                              />
                            </View>
                          )}
                      </View>
                    </>
                  )}
                  ListEmptyComponent={() => {
                    return (
                      <WsEmpty emptyTitle={t('目前尚無資料')} emptyText={''} />
                    )
                  }}
                  ListHeaderComponent={() => {
                    return (
                      <>
                        <WsText
                          fontWeight={400}
                          style={{
                            marginBottom: 16,
                          }}
                        >{t('抽檢')}</WsText>
                      </>
                    )
                  }}
                />
              </WsPaddingContainer>
            )}


            <WsPaddingContainer
              padding={0}
              style={{
                marginTop: 16,
                paddingTop: 16,
                paddingHorizontal: 16,
                backgroundColor: $color.white,
                marginBottom: 16,
              }}
            >
              <FlatList
                data={record.checklist_review_records}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, index }) => (
                  <>
                    {item.recorder &&
                      currentUser &&
                      item.recorder.id === currentUser.id && (
                        <WsIconBtn
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: index != 0 ? 16 : 16,
                            zIndex: 999
                          }}
                          name="md-more-horiz"
                          padding={0}
                          size={28}
                          onPress={() => {
                            if (item) {
                              setSelectedId(item.id)
                              setSelectedMode('editReview')
                              setReviewContent(item.content)
                              setReviewScore(item.score)
                              if (item.file_versions &&
                                item.file_versions.length > 0) {
                                const _array = item.file_versions.map(_ => _.source_url)
                                const _ids = item.file_versions.map(_ => _.id)
                                setReviewUploadFileURL(_array)
                                setReviewUploadFileURLIds(_ids)
                              }
                            }
                            setIsBottomSheetActive(true)
                          }}
                        />
                      )}

                    <View
                      style={{
                        paddingTop: index != 0 ? 16 : 16,
                        borderBottomWidth: 0.3,
                        paddingBottom: 16,
                        borderTopWidth: index === 0 ? 0.3 : 0,
                      }}
                    >
                      <WsFlex>
                        <WsText
                          style={{
                            marginRight: 16,
                            width: 72
                          }}
                          size={14} color={$color.gray}
                          fontWeight={'600'}
                        >
                          {t('結果')}
                        </WsText>
                        <WsTag
                          backgroundColor={item.score == 10 ? $color.green11l : $color.danger11l}
                          iconColor={item.score == 10 ? $color.green : $color.danger}
                          textColor={item.score == 10 ? $color.gray3d : $color.danger}
                          icon={item.score == 10 ? 'ws-filled-check-circle' : "ws-filled-cancel"}
                          borderRadius={16}
                        >
                          {item.score == 10 ? t('通過') : t('不通過')}
                        </WsTag>
                      </WsFlex>

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={80}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 16,
                          }}
                          label={t('覆核者')}
                          labelColor={$color.gray}
                          type={'user'}
                          value={item.recorder ? item.recorder : t('無')}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={80}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 16,
                          }}
                          label={t('時間')}
                          labelColor={$color.gray}
                          type='dateTime'
                          value={item.record_at ? moment(item.record_at).format('YYYY-MM-DD HH:mm') : t('無')}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={80}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 16,
                          }}
                          label={t('內容')}
                          labelColor={$color.gray}
                          value={item.content ? item.content : t('覆核者尚未填寫')}
                        />
                      </View>

                      {item.file_versions &&
                        item.file_versions.length > 0 && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              label={t('附件')}
                              type="filesAndImages"
                              labelColor={$color.gray}
                              value={item.file_versions}
                              style={{
                                flexDirection: 'row'
                              }}
                            />
                          </View>
                        )}

                      {item.attaches &&
                        item.attaches.length > 0 && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              label={t('附件')}
                              type="filesAndImages"
                              labelColor={$color.gray}
                              value={item.attaches}
                              style={{
                                flexDirection: 'row'
                              }}
                            />
                          </View>
                        )}
                    </View>
                  </>
                )}
                ListEmptyComponent={() => {
                  return (
                    <WsEmpty emptyTitle={t('目前尚無資料')} emptyText={''} />
                  )
                }}
                ListHeaderComponent={() => {
                  return (
                    <>
                      <WsText
                        fontWeight={400}
                        style={{
                          marginBottom: 16,
                        }}
                      >{t('覆核')}</WsText>
                    </>
                  )
                }}
              />
            </WsPaddingContainer>
            <View
              style={{
                height: 60
              }}
            >
            </View>
          </>
        ) : (
          <WsSkeleton></WsSkeleton>
        )}
      </ScrollView>
    </>
  )
}

export default CheckListResultOverview
