import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  Dimensions,
  TouchableOpacity,
  Modal
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
  WsSkeleton,
  WsModalFooter,
  WsIconBtn,
  WsBtn,
  WsGradientButton,
  WsTag,
  WsPopup,
  WsLoading
} from '@/components'
import { useTranslation } from 'react-i18next'
import CheckListAssignmentQuestionSortDraft from '@/sections/CheckList/CheckListAssignmentQuestionSortDraft'
import CheckListAssignmentResultSortDraft from '@/sections/CheckList/CheckListAssignmentResultSortDraft'
import S_Checklist from '@/services/api/v1/checklist'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import store from '@/store'
import {
  setCurrentChecklistRecordDraft,
  setCurrentCheckListQuestions,
  setPreloadChecklistAssignmentDraft,
  setOfflineMsg,
  setPreloadChecklistAssignment
} from '@/store/data'
import CheckListAssignmentOverview from '@/sections/CheckList/CheckListAssignmentOverview'
import AsyncStorage from '@react-native-community/async-storage';
import S_CheckListRecordDraft from '@/services/api/v1/checklist_record_draft'

const ChecklistPreview = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const _stack = navigation.getState().routes

  // Params
  const {
    id,
    versionId,
    _checklist_assignment_id,
    _reviewers,
    _checkers,
    _questions,
    _draftId,
    _todayDone,
    _constantData,
    subTabIndex,
    assignment,
    index, // 離線作業用
    questionFilteredBtnVisible,
    linkId
  } = route.params

  console.log(linkId,'linkId---');

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentChecklistDraft = useSelector(state => state.data.currentChecklistRecordDraft)
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)
  const currentPreloadChecklistAssignmentDraft = useSelector(state => state.data.preloadChecklistAssignmentDraft)
  const offlineMsg = useSelector(state => state.data.offlineMsg);

  // STORAGE
  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      AsyncStorage.setItem('offlineTempMsg', jsonValue);
    } catch (e) {
    }
  };

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [RightOnPressIsDisabled, setRightOnPressIsDisabled] = React.useState(true)
  const [popupActive002, setPopupActive002] = React.useState(false)

  const [batchQualifiedLoading, setBatchQualifiedLoading] = React.useState(false)

  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [popupActive, setPopupActive] = React.useState(false)

  const [reviewers, setReviews] = React.useState(_reviewers ? _reviewers : [])
  const [checklistAssignmentId, setChecklistAssignmentId] = React.useState(_checklist_assignment_id ? _checklist_assignment_id : null)

  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()
  const [status, setStatus] = React.useState(null)

  const [loading, setLoading] = React.useState(true)
  const [btnRightDisable, setBtnRightDisable] = React.useState(true)

  const [questions, setQuestions] = React.useState(_questions);

  const [answers, setAnswers] = React.useState()

  const [answersRiskHeader, setAnswersForRiskHeader] = React.useState()
  const [passRate, setPassRate] = React.useState()

  const [draftId, setDraftId] = React.useState(_draftId ? _draftId : null)

  const [checklist, setChecklist] = React.useState()

  const [tabIndex, settabIndex] = React.useState(2)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'CheckListAssignmentResultSortDraft',
      label: t('依結果排序'),
      view: CheckListAssignmentResultSortDraft,
      props: {
        id: id,
        versionId: versionId,
      }
    },
    {
      value: 'CheckListAssignmentQuestionSortDraft',
      label: t('依題目排序'),
      view: CheckListAssignmentQuestionSortDraft,
      props: {
        id: id,
        versionId: versionId,
      }
    }
  ])

  // Function
  const $_refreshTabItems = () => {
    const _tabItems = [
      {
        value: 'CheckListAssignmentOverview',
        label: t('總覽'),
        view: CheckListAssignmentOverview,
        props: {
          checklist: checklist,
          answersRiskHeader: answersRiskHeader,
          passRate: passRate
        }
      },
      {
        value: 'CheckListAssignmentResultSort',
        label: t('依結果排序'),
        view: CheckListAssignmentResultSortDraft,
        props: {
          id: id,
          versionId: versionId,
          answers: answers,
          questions: questions,
          setQuestions: setQuestions,
          todayDone: _todayDone,
          questionFilteredBtnVisible: questionFilteredBtnVisible,
          batchQualifiedLoading: batchQualifiedLoading,
          setBatchQualifiedLoading: setBatchQualifiedLoading
        }
      },
      {
        value: 'CheckListAssignmentQuestionSort',
        label: t('依題目排序'),
        view: CheckListAssignmentQuestionSortDraft,
        props: {
          id: id,
          versionId: versionId,
          questions: questions,
          setQuestions: setQuestions,
          todayDone: _todayDone,
          questionFilteredBtnVisible: questionFilteredBtnVisible,
          batchQualifiedLoading: batchQualifiedLoading,
          setBatchQualifiedLoading: setBatchQualifiedLoading,
        }
      }
    ]
    setTabItems(_tabItems)
  }

  // Services
  // 取得當前點檢表
  const $_fetchChecklist = async () => {
    try {
      const res = await S_Checklist.show({
        modelId: id
      })
      setChecklist(res)
      setLoading(false)
    } catch (e) {
      if (currentPreloadChecklistAssignment && currentPreloadChecklistAssignment[index]?.assignment.checklist) {
        const _checklist = currentPreloadChecklistAssignment[index].assignment.checklist
        setChecklist(_checklist)
        setLoading(false)
      } else if (currentPreloadChecklistAssignmentDraft && currentPreloadChecklistAssignmentDraft[index]?.assignment.checklist) {
        const _checklist = currentPreloadChecklistAssignmentDraft[index].assignment.checklist
        setChecklist(_checklist)
        setLoading(false)
      }
    }
  }

  // 把所有題目整理成要顯示的格式
  const $_fetchFormattedSortedQuestions = () => {
    const _questionsWithSequence = S_CheckListRecordAns.getQuestionsWithSequence(questions)
    const res = S_CheckListRecordAns.getFormatV2(_questionsWithSequence, _constantData)
    setAnswers(res)
    const _answerRiskHeader = S_CheckListRecordAns.getFormatRiskHeaderAns(res)
    setAnswersForRiskHeader(_answerRiskHeader)
    const _passRate = S_CheckListRecordAns.getPassRateV2(_answerRiskHeader).toString()
    setPassRate(_passRate)
  }

  // Functions
  const $_filterChecklistChecker = checkers => {
    const checker = checkers.find(checker => checker.id === currentUser.id)
    return checker
  }

  // VALIDATION
  const $_submitValidation = () => {
    const _validation = S_CheckListRecordAns.validationQuestionSubmit(questions, currentUser)
    if (_validation === false) {
      setBtnRightDisable(true)
    } else if (_validation === true) {
      setBtnRightDisable(false)
    }
  }

  // SUBMIT
  const $_onHeaderRightPress = () => {
    if (status == 1) {
      $_putApi()
      return
    }
    // console.log(JSON.stringify(currentChecklistDraft), 'currentChecklistDraft--');
    const _validation = S_CheckListRecordAns.validationQuestionSubmitV2(currentChecklistDraft ? currentChecklistDraft : questions, currentUser)
    if (_validation === false) {
      Alert.alert(t(`所有題目都必須答題，才能送出結果`))
      return
    }
    if (_validation === true) {
      $_putApi()
    }
  }

  const $_goBack = () => {
    navigation.navigate('CheckListAssignment', {
      subTabIndex: subTabIndex ? subTabIndex : 2
    })
  }

  // 送出點檢答題結果
  const $_putApi = async () => {
    setSubmitLoading(true)
    // console.log(currentChecklistDraft,'currentChecklistDraft1');
    // 過濾填答者為自己 或 無指定答題者的題目
    const _formattedQuestions = await S_CheckListRecordAns.formattedQuestionsForAPI_V2(
      currentChecklistDraft ? currentChecklistDraft : questions,
      currentUser.id
    )
    // console.log(JSON.stringify(_formattedQuestions), '_formattedQuestions-');
    // 整理成送出API的格式
    const _submitValue = S_CheckListRecord.setSubmitValue(
      checklist,
      currentUser.id,
      currentFactory.id,
      currentChecklistDraft,
      versionId,
      questions,
      _formattedQuestions,
      draftId,
      checklistAssignmentId,
      remark,
      status,
      remarkImages,
      reviewers,
      linkId
    )
    console.log(checklist.id, 'checklist_id');
    console.log(JSON.stringify(_submitValue), '_submitValue');
    try {
      const res = await S_CheckListRecordAns.batchStoreV2({ params: _submitValue });
      if (draftId && _checkers && currentUser && _checkers.length > 1) {
        Alert.alert(t(`請注意，若部分題號已經有人答題，本次送出將不會覆蓋他人先前已送出的答案。`));
      }
      store.dispatch(setCurrentChecklistRecordDraft(null));
      Alert.alert(t('作業已送出'))
    } catch (e) {
      console.error(e);
    }
    setSubmitLoading(false)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
          params: {
            refreshCounter: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
            subTabIndex: draftId ? 1 : subTabIndex ? subTabIndex : 0
          }
        }
      ],
      key: null
    })
  }

  // 儲存點檢草稿
  const $_saveDraft = async () => {
    setSubmitLoading(true)
    const _formattedQuestions = await S_CheckListRecordAns.formattedQuestionsForAPI_V2(
      currentChecklistDraft ? currentChecklistDraft : questions,
      currentUser.id
    )
    const _submitValue = S_CheckListRecordDraft.setSubmitForDraftV2(
      checklist,
      currentUser.id,
      currentFactory.id,
      currentChecklistDraft,
      versionId,
      questions,
      _formattedQuestions,
      draftId,
      checklistAssignmentId,
      remark,
      status,
      reviewers,
    )
    // console.log(draftId, 'draftId=');
    // console.log(JSON.stringify(_submitValue), '_submitValue=');
    if (draftId) {
      try {
        const res = await S_CheckListRecordDraft.updateDraftV2({
          modelId: draftId,
          params: _submitValue
        })
          .then(res => {
            Alert.alert(t('更新草稿成功'))
            store.dispatch(setCurrentChecklistRecordDraft(null))
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'CheckListAssignment',
                  params: {
                    refreshCounter: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
                    subTabIndex: 1
                  }
                }
              ],
              key: null
            })
          })
      } catch (e) {
        console.error(e.message, '更新草稿發生錯誤')
        const _offlineTempMsg = {
          service: `checklist_record`,
          method: `updateDraft`,
          modelId: draftId,
          data: _submitValue
        }
        offlineMsg.push(_offlineTempMsg)
        storeData(offlineMsg)
        store.dispatch(setOfflineMsg(offlineMsg))
        Alert.alert(`${offlineMsg?.length}筆資料等待上傳中`)
      }
    } else {
      try {
        const res = await S_CheckListRecordDraft.createDraftV2({ params: _submitValue })
          .then(res => {
            Alert.alert(t('儲存新草稿成功'))
            setSubmitLoading(false)
            store.dispatch(setCurrentChecklistRecordDraft(null))
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'CheckListAssignment',
                  params: {
                    refreshCounter: Math.floor(Math.random() * (100 - 1 + 1)) + 1
                  }
                }
              ],
              key: null
            })
          })
      } catch (e) {
        Alert.alert(t('儲存新草稿異常'))
        if (index != undefined && currentPreloadChecklistAssignment && currentPreloadChecklistAssignment[index]?.questions) {
          currentPreloadChecklistAssignment[index].questions = currentChecklistDraft
        }
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'CheckListAssignment',
              params: {
                refreshCounter: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
                subTabIndex: draftId ? 1 : subTabIndex ? subTabIndex : 0
              }
            }
          ],
          key: null
        })
      }
    }
  }

  // 刪除草稿
  const $_deleteChecklistDraft = async () => {
    try {
      const _res = await S_CheckListRecordDraft.delete({ modelId: draftId })
    } catch (error) {
      console.log(error, 'S_CheckListRecordDraft.delete')
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
          params: {
            refreshCounter: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
            subTabIndex: draftId ? 1 : subTabIndex ? subTabIndex : 0
          }
        }
      ],
      key: null
    })
  }

  // Options
  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerLeft: () => (
        <>
          <WsIconBtn
            testID="backButton"
            name={'md-arrow-back'}
            onPress={() => {
              setPopupActive(true)
            }}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }
  const $_onHeaderLeftPress = () => {
    store.dispatch(setCurrentChecklistRecordDraft(null))
    navigation.goBack()
  }

  // 檢查是否有題目被更新
  const $_isAnyQuestionUpdated = () => {
    const hasOutdatedQuestion = questions.some(question => {
      if (question.last_version && question.last_version.updated_at) {
        return new Date(question.last_version.updated_at) > new Date(question.answer_updated_at);
      }
      return false;
    });
    if (hasOutdatedQuestion) {
      Alert.alert(
        '存成草稿的作答所屬題目有變更，\n需要逐題確認作答',
        '',
        [
          {
            text: t('確定'),
            onPress: () => { },
          },
        ],
      );
    }
  }

  React.useEffect(() => {
    $_fetchChecklist()
    $_setNavigationOptions()
  }, [])

  React.useEffect(() => {
    if (questions) {
      $_fetchFormattedSortedQuestions()
      $_isAnyQuestionUpdated()
    }
  }, [questions])

  React.useEffect(() => {
    if (currentChecklistDraft) {
      if (_questions && currentChecklistDraft.length == _questions.length) {
        setQuestions(currentChecklistDraft)
      }
    }
  }, [currentChecklistDraft])

  React.useEffect(() => {
    if (answers) {
      $_refreshTabItems()
    }
  }, [answers])

  React.useEffect(() => {
    if (currentChecklistDraft) {
      // $_submitValidation()
      $_setNavigationOptions()
    }
  }, [currentChecklistDraft, remark])

  React.useEffect(() => {
    if (answersRiskHeader) {
      // $_submitValidation()
      $_setNavigationOptions()
    }
  }, [answersRiskHeader])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入Preview頁');
      $_fetchFormattedSortedQuestions()
    });

    return unsubscribe;
  }, [navigation, currentChecklistDraft]);

  React.useEffect(() => {
    if (remark && remark.trim()) {
      setRightOnPressIsDisabled(false)
    } else {
      setRightOnPressIsDisabled(true);
    }
  }, [remark]);

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        {loading ? (
          <>
            <SafeAreaView>
              <WsSkeleton />
              <WsSkeleton />
              <WsSkeleton />
            </SafeAreaView>
          </>
        ) : submitLoading ? (
          <>
            <Modal
              visible={submitLoading}
              transparent
              animationType="fade"
            >
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)', // 半透明背景
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <View style={{
                  padding: 20,
                  borderRadius: 10,
                  backgroundColor: 'transparent',
                }}>
                  <WsLoading size={30}></WsLoading>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <>
            {assignment && (
              <WsPaddingContainer
                backgroundColor={$color.white}
                style={{
                  paddingBottom: 0,
                }}
              >
                <WsText size={24}
                  style={{ marginBottom: 8 }}>
                  {assignment.checklist.name}
                </WsText>
                <WsFlex
                  flexWrap={'wrap'}
                  style={{}}
                >
                  {assignment.checklist.system_subclasses.map((subClass, subClassIndex) => {
                    return (
                      <WsTag
                        style={{
                          marginRight: 8,
                          marginBottom: 4
                        }}
                        key={`subClass${subClassIndex}`}
                        img={subClass.icon}>
                        {t(subClass.name)}
                      </WsTag>
                    )
                  })}
                </WsFlex>
              </WsPaddingContainer>
            )}

            <WsTabView
              isAutoWidth={true}
              items={tabItems}
              index={tabIndex}
              setIndex={settabIndex}
              fixedContainerHeight={height}
            />
            <WsModalFooter
              btnLeftHidden={_todayDone ? true : false}
              btnLeftText={t('不需點檢')}
              btnLeftOnPress={() => {
                setStateModal(true)
              }}
              btnRightHidden={draftId ? true : true}
              btnRightText={t('刪除草稿')}
              btnRightColors={[$color.danger, $color.danger5l]}
              btnRightOnPress={() => {
                setPopupActive002(true)
              }}
              style={{
                backgroundColor: $color.white
              }}
            />
            <WsModalFooter
              btnLeftHidden={_todayDone ? true : false}
              btnLeftText={t('儲存草稿')}
              btnLeftOnPress={() => {
                $_saveDraft()
              }}
              btnRightText={_todayDone ? t('關閉') : t('送出')}
              btnRightOnPress={() => {
                _todayDone ? $_goBack() : $_onHeaderRightPress()
              }}
            />
          </>
        )}
      </SafeAreaView>
      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
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
          >{t('確定刪除嗎？')}
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
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                alignItems: 'center',
                width: 110,
                height: 48,
                paddingVertical: 9,
              }}
              onPress={() => {
                setPopupActive002(false)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              btnColor={[$color.danger, $color.danger5l]}
              style={{
                width: 110,
              }}
              onPress={() => {
                $_deleteChecklistDraft()
                setPopupActive002(false)
              }}>
              {t('確除')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              flex: 1,
            }}
          >{t('確定捨棄嗎？')}
          </WsText>

          <WsFlex
            flexWrap={'wrap'}
            justifyContent={'flex-end'}
            alignItems="flex-end"
            style={{
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 9,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                alignItems: 'center',
                width: 110,
                height: 48
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110
              }}
              onPress={() => {
                $_onHeaderLeftPress()
                setPopupActive(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <Modal
        visible={batchQualifiedLoading}
        transparent={true}
        onRequestClose={() => {
        }}
      >
        <WsLoading
          type={'b'}
          style={{
            flex: 1,
            zIndex: 9999
          }}
        ></WsLoading>
      </Modal >
      <WsModal
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        headerRightText={t('儲存')}
        RightOnPressIsDisabled={RightOnPressIsDisabled}
        headerRightOnPress={() => {
          $_onHeaderRightPress()
          setStateModal(false)
        }}
        animationType="slide"
      >
        <WsState
          label={t('輸入備註')}
          labelIcon={'ws-outline-edit-pencil'}
          multiline={true}
          style={{
            padding: 16
          }}
          placeholder={t('請寫下不需點檢的原因與細部說明...')}
          // placeholderTextColor={'rgba(255, 0, 0, 1)'}
          value={remark}
          onChange={$event => {
            setRemark($event)
            setStatus(1)
          }}
        />
        <WsState
          style={{
            paddingHorizontal: 16
          }}
          type="filesAndImages"
          label={t('圖片')}
          labelIcon={'md-photo'}
          value={remarkImages}
          onChange={$event => {
            setRemarkImages($event)
          }}
        />
      </WsModal>
    </>
  )
}

export default ChecklistPreview
