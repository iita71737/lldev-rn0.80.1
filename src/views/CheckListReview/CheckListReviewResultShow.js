import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TextInput,
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
  WsBtn,
  WsEmpty,
  WsInfo,
  WsIconBtn,
  WsBottomSheet,
  WsSkeleton,
  WsTag,
  WsSpec
} from '@/components'
import { useTranslation } from 'react-i18next'
import CheckListAssignmentQuestionSort from '@/sections/CheckList/CheckListAssignmentQuestionSort'
import CheckListAssignmentResultSort from '@/sections/CheckList/CheckListAssignmentResultSort'
import CheckListAssignmentReviewOverview from '@/sections/CheckList/CheckListAssignmentReviewOverview'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { SafeAreaView } from 'react-native-safe-area-context'
import S_GeneralRecord from '@/services/api/v1/general_record'

const CheckListReviewResultShow = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [answers, setAnswers] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)
  const [record, setRecord] = React.useState()
  const [tabIndex, settabIndex] = React.useState(0)
  const [reviewAt, setReviewAt] = React.useState()
  const [isDisabled, setIsDisabled] = React.useState(true);

  // BOTTOM SHEET
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

  const [sampleContent, setSampleContent] = React.useState()
  const [sampleScore, setSampleScore] = React.useState(0)
  const [sampleUploadFileURL, setSampleUploadFileURL] = React.useState()

  const [tabItems, setTabItems] = React.useState([
    {
      value: 'CheckListAssignmentReviewOverview',
      label: t('總覽'),
      view: CheckListAssignmentReviewOverview,
      props: {
        id: id,
        setIsBottomSheetActive: setIsBottomSheetActive,
        setSelectedId: setSelectedId,
        setSelectedMode: setSelectedMode,

        setReviewContent: setReviewContent,
        setReviewScore: setReviewScore,
        setReviewUploadFileURL: setReviewUploadFileURL,

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
      }
    },
    {
      value: 'CheckListAssignmentQuestionSort',
      label: t('依題目排序'),
      view: CheckListAssignmentQuestionSort,
      props: {
        id: id
      }
    }
  ])

  // Services
  const $_fetchRecord = async () => {
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
  }
  const $_fetchSortedQuestionsByResult = async () => {
    const res = await S_CheckListRecordAns.getSortedByResultV2(id)
    setAnswers(res)
  }

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'CheckListAssignmentReviewOverview',
        label: t('總覽'),
        view: CheckListAssignmentReviewOverview,
        props: {
          id: id,
          setIsBottomSheetActive: setIsBottomSheetActive,
          setSelectedId: setSelectedId,
          setSelectedMode: setSelectedMode,

          setReviewContent: setReviewContent,
          setReviewScore: setReviewScore,
          setReviewUploadFileURL: setReviewUploadFileURL,

          setSampleContent: setSampleContent,
          setSampleScore: setSampleScore,
          setSampleUploadFileURL: setSampleUploadFileURL,

          _records: record,
        }
      },
      {
        value: 'CheckListAssignmentResultSort',
        label: t('依結果排序'),
        view: CheckListAssignmentResultSort,
        props: {
          id: id,
          answers, answers
        }
      },
      {
        value: 'CheckListAssignmentQuestionSort',
        label: t('依題目排序'),
        view: CheckListAssignmentQuestionSort,
        props: {
          id: id
        }
      }
    ])
  }

  // CREATE OR UPDATE REVIEW
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
      type: selectedMode === 'editSample' ? "sample" : "review",
      recorder: currentUser ? currentUser.id : null,
      score: selectedMode === 'editSample' ? sampleScore : reviewScore,
      record_at: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      content: selectedMode === 'editSample' ? sampleContent : reviewContent,
      attaches: selectedMode === 'editSample' ? formattedForFileStore(sampleUploadFileURL) : formattedForFileStore(reviewUploadFileURL),
      model: "checklist_record",
      model_id: id
    }
    console.log(_params, '_params');
    if (!selectedId) {
      try {
        const res = await S_GeneralRecord.create({
          params: _params
        })
        if (res) {
          // 跳轉
          navigation.reset({
            index: 1,
            routes: [
              {
                name: 'CheckListAssignment',
                params: {
                  refreshCounter: Math.floor(Math.random() * (100 - 1 + 1)) + 1
                }
              },
              {
                name: 'ViewCheckListReviewed',
                params: {
                  id: id,
                }
              }
            ],
            key: null
          })
          Alert.alert('新增成功')
        }
        $_fetchRecord()
      } catch (err) {
        console.error(err, 'S_GeneralRecord Create Error')
        Alert.alert('新增失敗')
      }
    } else if (selectedId) {
      try {
        const res = await S_GeneralRecord.patch({
          params: _params,
          modelId: selectedId
        })
        Alert.alert('編輯成功')
        $_fetchRecord()
      } catch (err) {
        console.error(err, 'S_GeneralRecord patch Error')
        Alert.alert('編輯失敗')
      }
    }
  }

  // DELETE REVIEW
  const $_onDelete = async () => {
    if (selectedId) {
      try {
        const res = await S_GeneralRecord.delete({
          modelId: selectedId
        })
        if (res) {
          navigation.navigate('RoutesCheckList', {
            screen: 'ViewCheckListReviewed',
            params: {
              id: id
            }
          })
        }
        $_fetchRecord()
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
      $_onDelete()
    }
  }


  React.useEffect(() => {
    $_fetchSortedQuestionsByResult()
  }, [id])

  React.useEffect(() => {
    $_fetchRecord()
  }, [])

  React.useEffect(() => {
    $_setTabItems()
  }, [record, answers])

  React.useEffect(() => {
    const isSampleContentInvalid = !sampleContent || sampleContent.trim() === '';
    const isReviewContentInvalid = !reviewContent || reviewContent.trim() === '';
    if (selectedMode === 'editSample') {
      setIsDisabled(isSampleContentInvalid || sampleScore === null);
    } else if (selectedMode === 'editReview') {
      setIsDisabled(isReviewContentInvalid || reviewScore === null);
    }
  }, [selectedMode, sampleContent, sampleScore, reviewContent, reviewScore]);

  return (
    <>
      <WsTabView
        isAutoWidth={true}
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
      />

      {record &&
        (record.checklist_review_records != undefined &&
          record.checklist_review_records.length == 0 ||
          !record.checklist_review_records) && (
          <WsBtn
            style={{
              marginBottom: 16,
            }}
            onPress={() => {
              setSelectedId()
              setSelectedMode('editReview')
              setReviewScore()
              setReviewContent('')
              setReviewUploadFileURL('')
              setStateModal(true)
            }}>
            {t('覆核')}
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
        RightOnPressIsDisabled={isDisabled}
        colorDisabled={$color.white}
        headerRightOnPress={() => {
          $_onSubmit()
          setStateModal(false)
        }}
        animationType="slide"
        title={selectedMode === 'editSample' ? t('抽檢') : t('覆核')}
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
                padding: 16,
              }}
            >
              <WsState
                style={{
                  height: 65,
                }}
                label={selectedMode === 'editSample' ? t('結果') : t('結果')}
                type="radio"
                items={[
                  { label: t('通過'), value: 10 },
                  { label: t('不通過'), value: 5 }
                ]}
                rules={'required'}
                value={selectedMode === 'editSample' ? sampleScore : reviewScore ? reviewScore : null}
                onChange={selectedMode === 'editSample' ? setSampleScore : setReviewScore}
              >
              </WsState>

              <WsState
                testID={selectedMode === 'editSample' ? t('內容') : t('內容')}
                style={{
                  marginTop: 16,
                }}
                stateStyle={{
                }}
                label={selectedMode === 'editSample' ? t('內容') : t('內容')}
                multiline={true}
                rules={'required'}
                value={selectedMode === 'editSample' ? sampleContent : reviewContent}
                onChange={selectedMode === 'editSample' ? setSampleContent : setReviewContent}
              >
              </WsState>

              <WsState
                style={{
                  marginTop: 16,
                }}
                label={t('附件')}
                type={'Ll_filesAndImages'}
                modelName={'checklist_record'}
                value={selectedMode === 'editSample' ? sampleUploadFileURL : reviewUploadFileURL}
                onChange={(e, ids) => {
                  if (selectedMode === 'editSample') {
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

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={['25%', '40%']}
        onItemPress={$_onBottomSheetItemPress}
        underlayColor={$color.primary11l}
      />
    </>
  )
}

export default CheckListReviewResultShow
