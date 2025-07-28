import React from 'react'
import { Pressable, ScrollView, View, TextInput, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native'
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
  LlEffectWithCheckListCalc,
  WsState,
  WsBtn,
  WsEmpty,
  WsInfo,
  WsIconBtn,
  WsBottomSheet,
  WsTag,
  WsDes,
  WsInfoUsers002,
  WsSkeleton,
  WsSpec
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { SafeAreaView } from 'react-native-safe-area-context'
import S_GeneralRecord from '@/services/api/v1/general_record'

const CheckListAssignmentReviewOverview = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const {
    id,
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
    setSampleUploadFileURLIds,

    _records
  } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [loading, setLoading] = React.useState(true)
  const [record, setRecord] = React.useState()
  const [answers, setAnswers] = React.useState()
  const [passRate, setPassRate] = React.useState()

  const [tabIndex, settabIndex] = React.useState(0)
  const [reviewAt, setReviewAt] = React.useState()

  // BOTTOM SHEET
  const [selectedReviewed, setSelectedReviewed] = React.useState()
  const [bottomSheetItems] = React.useState([
    {
      type: 'edit',
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    {
      type: 'delete',
      color: $color.danger,
      labelColor: $color.danger,
      icon: 'ws-outline-delete',
      label: t('刪除')
    }
  ])

  // Services
  const $_fetchAnswers = async () => {
    try {
      const res = await S_CheckListRecord.showV2({ modelId: id })
      setRecord(res)
      setReviewAt(res.review_at)
      if (res && res.checklist_review_records && res.checklist_review_records.length > 0) {
        const _defaultContent = res.checklist_review_records.find(item => {
          if (!item.recorder) {
            return
          }
          return item.recorder.id == currentUser.id;
        })
      }
      if (res) {
        setPassRate(res.pass_rate)
      }
      const res2 = await S_CheckListRecordAns.indexV2({ parentId: id })
      setAnswers(res2.data)
      Promise.all([res, res2])
        .then(res => {
          setLoading(false)
        })
        .catch(error => {
          console.error(error);
        })
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchAnswers()
  }, [_records])

  return (
    <>
      <ScrollView
        testID={'ScrollView'}
        style={{
          flex: 1
        }}
      >
        {!loading ? (
          <>
            {record && (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                }}>
                <WsFlex justifyContent="space-between" alignItems="flex-start">
                  <View
                    style={{
                      flex: 1,
                    }}>
                    <WsText size={24}>{record?.name}</WsText>
                    {record.system_subclasses &&
                      record.system_subclasses.length > 0 && (
                        <WsFlex
                          style={{
                            marginTop: 16
                          }}
                          flexWrap="wrap"
                        >
                          {record.system_subclasses.map(
                            (systemSubClass, systemSubClassIndex) => {
                              return (
                                <WsTag
                                  key={systemSubClass.id}
                                  img={systemSubClass.icon}
                                  style={{
                                    marginRight: 8,
                                    marginTop: 8
                                  }}>
                                  {t(systemSubClass.name)}
                                </WsTag>
                              )
                            }
                          )}
                        </WsFlex>
                      )}

                    {record &&
                      record.assignment_start_time &&
                      record.assignment_end_time && (
                        <>
                          <WsSpec
                            titleSize={14}
                            fontWeight={600}
                            fontSize={14}
                            labelWidth={58}
                            style={{
                              marginTop: 8,
                            }}
                            title={t('時段')}>
                            {`${moment(record.assignment_start_time).format('HH:mm')}-${moment(record.assignment_end_time).format('HH:mm')}`}
                          </WsSpec>
                        </>
                      )}
                  </View>
                </WsFlex>
              </WsPaddingContainer>
            )}
            <LlRiskHeaderCalc answers={answers} passRate={passRate} />
            <LlEffectWithCheckListCalc answers={answers} />
            <WsPaddingContainer
              style={{
                marginTop: 16,
                backgroundColor: $color.white,
              }}>
              <WsFlex
                justifyContent="space-between"
                alignItems="flex-start"
                style={{
                }}
              >
                {record.checkers && (
                  <WsInfo
                    labelWidth={60}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                    type="usersWithTag"
                    label={t('答題者')}
                    value={record.checkers}
                    isUri={true}
                  />
                )}
              </WsFlex>
            </WsPaddingContainer>

            <WsPaddingContainer
              padding={0}
              style={{
                paddingTop: 16,
                paddingHorizontal: 16,
                backgroundColor: $color.white,
                marginTop: 16,
              }}
            >
              <FlatList
                testID={'flatList'}
                data={record.checklist_review_records}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, index }) => (
                  <>

                    <View
                      style={{
                        borderBottomWidth: index == record.checklist_review_records?.length - 1 ? null : 0.3,
                        marginBottom: 16,
                        paddingBottom: 16,
                        // borderWidth: 1,
                      }}
                    >
                      {item.recorder &&
                        currentUser &&
                        item.recorder.id === currentUser.id && (
                          <WsIconBtn
                            testID={`checklist_review_record-${index}`}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
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
                                setReviewUploadFileURL(item.attaches)
                              }
                              setIsBottomSheetActive(true)
                            }}
                          />
                        )}

                      <View>
                        <WsInfo
                          labelWidth={100}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 16,
                          }}
                          label={t('內容')}
                          labelColor={$color.gray}
                          value={item.content ? item.content : t('覆核者尚未填寫')}
                        />
                        <WsInfo
                          labelWidth={100}
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
                        <WsInfo
                          labelWidth={100}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 16,
                          }}
                          label={t('覆核日期')}
                          labelColor={$color.gray}
                          type='dateTime'
                          value={item.record_at ? item.record_at : t('無')}
                        />
                        <WsFlex>
                          <WsText
                            style={{
                              marginRight: 16,
                              width: 100,
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

                        {item.file_versions &&
                          item.file_versions.length > 0 && (
                            <WsFlex
                              alignItems="flex-start"
                            >
                              <WsText
                                style={{
                                  marginRight: 16,
                                  width: 60,
                                }}
                                size={14} color={$color.gray}
                                fontWeight={'600'}
                              >
                                {t('附件')}
                              </WsText>
                              <WsInfo
                                style={{
                                  flex: 1,
                                }}
                                type="files"
                                labelColor={$color.gray}
                                value={item.file_versions}
                              />
                            </WsFlex>
                          )}

                        {item.attaches &&
                          item.attaches.length > 0 && (
                            <WsFlex
                              alignItems="flex-start"
                              style={{
                              }}
                            >
                              <WsText
                                style={{
                                  marginRight: 16,
                                  width: 60
                                }}
                                size={14} color={$color.gray}
                                fontWeight={'600'}
                              >
                                {t('附件')}
                              </WsText>
                              <WsInfo
                                type="filesAndImages"
                                labelColor={$color.gray}
                                value={item.attaches}
                              />
                            </WsFlex>
                          )}
                      </View>

                    </View>
                  </>
                )}
                ListEmptyComponent={() => {
                  return (
                    <WsEmpty image={null} emptyTitle={t('目前尚無資料')} emptyText={''} />
                  )
                }}
              />
            </WsPaddingContainer>

            <WsPaddingContainer
              padding={0}
              style={{
                paddingTop:16,
                paddingHorizontal: 16,
                backgroundColor: $color.white,
                marginTop: 16,
                marginBottom: 60,
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
                            top: 0,
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
                      )}

                    <View
                      style={{
                        marginBottom: 16,
                        borderBottomWidth: index == record.checklist_sample_records?.length - 1 ? null : 0.3,
                        paddingBottom: 16,
                        // borderWidth: 1,
                      }}
                    >
                      <WsInfo
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={t('內容')}
                        labelColor={$color.gray}
                        value={item.content ? item.content : t('抽檢者尚未填寫')}
                      />

                      <WsInfo
                        labelWidth={60}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={t('抽檢者')}
                        labelColor={$color.gray}
                        type={'user'}
                        value={item.recorder ? item.recorder : t('無')}
                      />
                      <WsInfo
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginRight: 16,
                        }}
                        label={t('時間')}
                        labelColor={$color.gray}
                        type='dateTime'
                        value={item.record_at ? item.record_at : t('無')}
                      />
                      <WsFlex
                        style={{
                        }}
                      >
                        <WsText
                          style={{
                            marginRight: 16,
                            width: 60,
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

                      {item.file_versions &&
                        item.file_versions.length > 0 && (
                          <WsFlex
                            alignItems="flex-start"
                            style={{
                            }}
                          >
                            <WsText
                              style={{
                                marginRight: 16,
                                width: 60
                              }}
                              size={14} color={$color.gray}
                              fontWeight={'600'}
                            >
                              {t('附件')}
                            </WsText>
                            <WsInfo
                              type="files"
                              labelColor={$color.gray}
                              value={item.file_versions}
                            />
                          </WsFlex>
                        )}

                      {item.attaches &&
                        item.attaches.length > 0 && (
                          <WsFlex
                            alignItems="flex-start"
                            style={{
                            }}
                          >
                            <WsText
                              style={{
                                marginRight: 16,
                                width: 60
                              }}
                              size={14} color={$color.gray}
                              fontWeight={'600'}
                            >
                              {t('附件')}
                            </WsText>
                            <WsInfo
                              type="filesAndImages"
                              labelColor={$color.gray}
                              value={item.attaches}
                            />
                          </WsFlex>
                        )}
                    </View>
                  </>
                )}
                ListEmptyComponent={() => {
                  return (
                    <WsEmpty image={null} emptyTitle={'目前尚無資料'} emptyText={''} />
                  )
                }}
              />
            </WsPaddingContainer>
          </>
        ) : (
          <WsSkeleton></WsSkeleton>
        )}
      </ScrollView>
    </>
  )
}

export default CheckListAssignmentReviewOverview
