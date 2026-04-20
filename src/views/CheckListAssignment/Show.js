import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  Alert
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
  WsBottomSheet,
  WsSkeleton,
  WsSpec,
  WsPopup
} from '@/components'
import { useTranslation } from 'react-i18next'
import CheckListAssignmentQuestionSort from '@/sections/CheckList/CheckListAssignmentQuestionSort'
import CheckListAssignmentResultSort from '@/sections/CheckList/CheckListAssignmentResultSort'
import CheckListResultOverview from '@/sections/CheckList/CheckListResultOverview'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { scopePermission } from '@/__reactnative_stone/global/permission'
import S_GeneralRecord from '@/services/api/v1/general_record'

const CheckListReviewResultShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    versionId
  } = route.params

  console.log(id, '=id=');
  console.log(versionId, '=versionId=');

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUserScope = useSelector(state => state.data.userScopes)

  // State
  const [isDisabled, setIsDisabled] = React.useState(true);
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
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
  const [selectedId, setSelectedId] = React.useState()
  const [selectedMode, setSelectedMode] = React.useState('')

  const [reviewContent, setReviewContent] = React.useState()
  const [reviewScore, setReviewScore] = React.useState(0)
  const [reviewUploadFileURL, setReviewUploadFileURL] = React.useState()
  const [reviewUploadFileURLIds, setReviewUploadFileURLIds] = React.useState([])

  const [sampleContent, setSampleContent] = React.useState()
  const [sampleScore, setSampleScore] = React.useState(0)
  const [sampleUploadFileURL, setSampleUploadFileURL] = React.useState()

  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const [answers, setAnswers] = React.useState()
  const [record, setRecord] = React.useState()

  const [stateModal, setStateModal] = React.useState(false)
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'CheckListResultOverview',
      label: t('總覽'),
      view: CheckListResultOverview,
      props: {
        id: id,
        refreshCounter: refreshCounter
      }
    }
  ])
  const [popupDelete, setPopupDelete] = React.useState(false)

  // Services
  const $_fetchRecord = async () => {
    const res = await S_CheckListRecord.showV2({ modelId: id })
    if (!res) {
      return
    }
    setRecord(res)
  }
  const $_fetchSortedQuestionsByResult = async () => {
    const answersApi = await S_CheckListRecordAns.indexV2({ parentId: id });
    const _formattedAnswers = S_CheckListRecordAns.getFormatV2(answersApi.data);
    setAnswers(_formattedAnswers)
  }


  const $_setTabItems = () => {
    if (record && record.status == 1) {
      setTabItems([
        {
          value: 'CheckListResultOverview',
          label: t('總覽'),
          view: CheckListResultOverview,
          props: {
            id: id,
            refreshCounter: refreshCounter,

            setIsBottomSheetActive: setIsBottomSheetActive,
            setSelectedId: setSelectedId,
            setSelectedMode: setSelectedMode,

            setReviewContent: setReviewContent,
            setReviewScore: setReviewScore,
            setReviewUploadFileURL: setReviewUploadFileURL,
            setReviewUploadFileURLIds: setReviewUploadFileURLIds,

            setSampleContent: setSampleContent,
            setSampleScore: setSampleScore,
            setSampleUploadFileURL: setSampleUploadFileURL,
          }
        },
      ])
    } else {
      setTabItems([
        {
          value: 'CheckListResultOverview',
          label: t('總覽'),
          view: CheckListResultOverview,
          props: {
            id: id,
            refreshCounter: refreshCounter,

            setIsBottomSheetActive: setIsBottomSheetActive,
            setSelectedId: setSelectedId,
            setSelectedMode: setSelectedMode,

            setReviewContent: setReviewContent,
            setReviewScore: setReviewScore,
            setReviewUploadFileURL: setReviewUploadFileURL,
            setReviewUploadFileURLIds: setReviewUploadFileURLIds,

            setSampleContent: setSampleContent,
            setSampleScore: setSampleScore,
            setSampleUploadFileURL: setSampleUploadFileURL,
          }
        },
        {
          value: 'CheckListAssignmentResultSort',
          label: t('依結果排序'),
          view: CheckListAssignmentResultSort,
          props: {
            id: id,
            answers: answers
          }
        },
        {
          value: 'CheckListAssignmentQuestionSort',
          label: t('依題目排序'),
          view: CheckListAssignmentQuestionSort,
          props: {
            id: id,
            versionId: versionId
          }
        }
      ])
    }

  }

  // Functions
  const $_onSubmit = async () => {
    const formattedForFileStore = (attaches) => {
      return attaches && attaches.map(item => {
        const newItem = {
          file: item.file.id
        };
        if (item.file_version) {
          newItem.file_version = item.file_version.id;
        }
        return newItem;
      });
    }
    const _params = {
      type: selectedMode === 'createSample' || selectedMode === 'editSample' ? "sample" : "review",
      recorder: currentUser ? currentUser.id : null,
      score: selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleScore : reviewScore,
      record_at: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      content: selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleContent : reviewContent,
      attaches: selectedMode === 'createSample' || selectedMode === 'editSample' ? formattedForFileStore(sampleUploadFileURL) : formattedForFileStore(reviewUploadFileURL),
      model: "checklist_record",
      model_id: id
    }
    console.log(_params, '_params');
    console.log(selectedMode, 'selectedMode-');
    if (!selectedId) {
      try {
        const res = await S_GeneralRecord.create({
          params: _params
        }).then(res => {
          setRefreshCounter(refreshCounter + 1)
        })
      } catch (err) {
        console.error(err, 'S_GeneralRecord Create Error')
        Alert.alert('新增失敗')
      }
    } else if (selectedId) {
      try {
        const res = await S_GeneralRecord.patch({
          params: _params,
          modelId: selectedId
        }).then(res => {
          setRefreshCounter(refreshCounter + 1)
        })
      } catch (err) {
        console.error(err, 'S_GeneralRecord patch Error')
      }
    }
  }


  const $_createSample = () => {
    setStateModal(true)
  }

  // DELETE REVIEW
  const $_onDelete = async () => {
    if (selectedId) {
      try {
        const res = await S_GeneralRecord.delete({
          modelId: selectedId
        })
        if (res) {
          navigation.replace('RoutesCheckList', {
            screen: 'ViewCheckListReviewed',
            params: {
              id: id
            }
          })
        }
        setSelectedId(null)
        setRefreshCounter(refreshCounter + 1)
      } catch (err) {
        console.error(err, 'S_GeneralRecord Delete Error')
      }
    }
  }
  // BOTTOM SHEET PRESS ITEM
  const $_onBottomSheetItemPress = item => {
    if (item && item.type === 'edit') {
      setStateModal(true)
    } else if (item && item.type === 'delete') {
      // $_onDelete()
      setPopupDelete(true)
    }
  }

  React.useEffect(() => {
    $_fetchSortedQuestionsByResult()
    $_fetchRecord()
  }, [])

  React.useEffect(() => {
    if (record) {
      $_setTabItems()
    }
  }, [refreshCounter, record, answers])

  React.useEffect(() => {
    const isSampleContentEmpty = !sampleContent || sampleContent.trim() === '';
    const isReviewContentEmpty = !reviewContent || reviewContent.trim() === '';
    if (selectedMode === 'createSample' || selectedMode === 'editSample') {
      setIsDisabled(isSampleContentEmpty || sampleScore === null);
    }
    if (selectedMode === 'createReview' || selectedMode === 'editReview') {
      setIsDisabled(isReviewContentEmpty || reviewScore === null);
    }
  }, [selectedMode, sampleContent, sampleScore, reviewContent, reviewScore]);

  return (
    <>
      {/* DO NOT SET SCROLL_VIEW OUTSIDE OF TAB_VIEW */}
      {record ? (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
            }}>
            <WsFlex justifyContent="space-between" alignItems="flex-start">
              <View
                style={{
                  flex: 1,
                }}>
                <WsText size={24}>{record.name}</WsText>
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

          <WsTabView
            isAutoWidth={true}
            items={tabItems}
            index={tabIndex}
            setIndex={settabIndex}
          />
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
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
        RightOnPressIsDisabled={isDisabled}
        headerRightOnPress={() => {
          $_onSubmit()
          setStateModal(false)
        }}
        animationType="slide"
        title={selectedMode === 'createSample' || selectedMode === 'editSample' ? t('抽檢') : t('覆核')}
      >
        <KeyboardAvoidingView
          style={{
            // flex: 1, // DO NOT SET
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          enabled
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                // flex: 1, // DO NOT SET
                padding: 16
              }}
            >
              <WsState
                style={{
                }}
                label={selectedMode === 'createSample' || selectedMode === 'editSample' ? t('結果') : t('結果')}
                type="radio"
                items={[
                  { label: t('通過'), value: 10 },
                  { label: t('不通過'), value: 5 }
                ]}
                rules={'required'}
                value={selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleScore : reviewScore}
                onChange={selectedMode === 'createSample' || selectedMode === 'editSample' ? setSampleScore : setReviewScore}
              >
              </WsState>

              <WsState
                testID={selectedMode === 'createSample' || selectedMode === 'editSample' ? '內容' : '內容'}
                style={{
                  marginTop: 16,
                }}
                stateStyle={{
                  height: 140
                }}
                label={selectedMode === 'createSample' || selectedMode === 'editSample' ? t('內容') : t('內容')}
                placeholder={t('輸入')}
                multiline={true}
                rules={'required'}
                value={selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleContent : reviewContent}
                onChange={selectedMode === 'createSample' || selectedMode === 'editSample' ? setSampleContent : setReviewContent}
              >
              </WsState>

              <WsState
                style={{
                  marginTop: 16
                }}
                label={t('附件')}
                type={'Ll_filesAndImages'}
                modelName={'checklist_record'}
                value={selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleUploadFileURL : reviewUploadFileURL}
                onChange={(e, ids) => {
                  if (selectedMode === 'createSample' || selectedMode === 'editSample') {
                    setSampleUploadFileURL(e)
                  } else if (selectedMode === 'editReview') {
                    setReviewUploadFileURL(e)
                  }
                }}
              >
              </WsState>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </WsModal>

      {record && scopePermission('checklist-sample-record', currentUserScope) &&
        record.status != 1 && (
          <WsGradientButton
            borderRadius={30}
            style={{
              marginBottom: 16,
            }}
            onPress={() => {
              setSelectedMode('createSample')
              setSelectedId(null)
              setSampleContent('')
              setSampleScore(0)
              setSampleUploadFileURL('')
              $_createSample()
            }}>
            {t('抽檢')}
          </WsGradientButton>
        )}

      {record &&
        (record.checklist_review_records != undefined &&
          record.checklist_review_records.length == 0 ||
          !record.checklist_review_records) &&
        (record.reviewers?.length > 0) && (
          <WsGradientButton
            borderRadius={30}
            style={{
              marginBottom: 24,
            }}
            onPress={() => {
              setSelectedId()
              setSelectedMode('editReview')
              setReviewScore()
              setReviewContent('')
              setReviewUploadFileURL('')
              setStateModal(true)
            }}
          >
            {t('覆核')}
          </WsGradientButton>
        )}

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={['25%', '25%']}
        onItemPress={$_onBottomSheetItemPress}
        underlayColor={$color.primary11l}
      />

      <WsPopup
        active={popupDelete}
        onClose={() => {
          setPopupDelete(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定要刪除嗎？')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupDelete(false)
              }}>
              <WsText
                style={{
                  padding: 1
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                $_onDelete()
                setPopupDelete(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

    </>
  )
}

export default CheckListReviewResultShow
