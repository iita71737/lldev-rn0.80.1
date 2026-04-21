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
  Modal,
  Platform
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
  WsLoading,
  WsIcon
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
  setPreloadChecklistAssignment
} from '@/store/data'
import CheckListAssignmentOverview from '@/sections/CheckList/CheckListAssignmentOverview'

const ChecklistPreview = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    versionId,
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
    linkId,
    checklistRecordId
  } = route.params

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentChecklistDraft = useSelector(state => state.data.currentChecklistRecordDraft)
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)
  const currentPreloadChecklistAssignmentDraft = useSelector(state => state.data.preloadChecklistAssignmentDraft)
  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [RightOnPressIsDisabled, setRightOnPressIsDisabled] = React.useState(true)

  const [batchQualifiedLoading, setBatchQualifiedLoading] = React.useState(false)

  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [popupActive, setPopupActive] = React.useState(false)

  const [reviewers, setReviews] = React.useState(_reviewers ? _reviewers : [])

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
        checklistRecordId: checklistRecordId,
      }
    },
    {
      value: 'CheckListAssignmentQuestionSortDraft',
      label: t('依題目排序'),
      view: CheckListAssignmentQuestionSortDraft,
      props: {
        id: id,
        versionId: versionId,
        checklistRecordId: checklistRecordId,
      }
    }
  ])

  const $_getRefreshCounter = () => Math.floor(Math.random() * (100 - 1 + 1)) + 1
  const $_resetToCheckListAssignment = (_routeParams = {}) => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
          params: {
            refreshCounter: $_getRefreshCounter(),
            ..._routeParams
          }
        }
      ],
      key: null
    })
  }

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
          setBatchQualifiedLoading: setBatchQualifiedLoading,
          checklistRecordId: checklistRecordId,
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
          checklistRecordId: checklistRecordId,
        }
      }
    ]
    setTabItems(_tabItems)
  }

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
  const $_getRemarkImagesForPayload = (_images = []) => {
    if (!Array.isArray(_images)) return []
    return _images
      .map(item => item?.id || item?.file?.id)
      .filter(Boolean)
      .map(fileId => ({ file: fileId }))
  }

  // 不需點檢
  const $_noChecklist = async () => {
    try {
      let _checklistRecordId = checklistRecordId
      if (!_checklistRecordId) {
        const _createRecordParams = {
          checklist: id,
          checklist_version: versionId ? versionId : checklist?.last_version?.id,
          factory: currentFactory?.id,
          reviewers: reviewers ? reviewers.map(item => item.id) : [],
          from_module_link_id: linkId ? linkId : undefined,
        }
        const _createdRecord = await S_CheckListRecord.store({ params: _createRecordParams })
        if (!_createdRecord?.id) {
          throw new Error('Failed to create checklist record before noChecklist')
        }
        _checklistRecordId = _createdRecord.id
      }

      const _nochecklistParams = {
        checklist_record_id: _checklistRecordId,
        remark: remark,
        images: $_getRemarkImagesForPayload(remarkImages),
      }
      await S_CheckListRecord.noChecklist({ params: _nochecklistParams })
      store.dispatch(setCurrentChecklistRecordDraft(null))
      Alert.alert(t('作業已送出'))
      $_resetToCheckListAssignment({ initTabIndex: 2 })
    } catch (error) {
      console.error('noChecklist failed', error)
      Alert.alert(t('不需點檢送出失敗'))
    } finally {
      setSubmitLoading(false)
    }
  }

  // SUBMIT
  const $_onHeaderRightPress = async () => {
    if (status == 1) {
      await $_noChecklist()
      return
    }
    // console.log(JSON.stringify(currentChecklistDraft ? currentChecklistDraft : questions), 'currentChecklistDraft--');
    const _validation = S_CheckListRecordAns.validationQuestionSubmitV2(currentChecklistDraft ? currentChecklistDraft : questions, currentUser)
    // console.log(_validation, '_validation')
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
    console.log('$_putApi')
    let _shouldNavigate = false
    try {
      const COMPLETE_TIMEOUT_MS = 15000
      const _params = {
        checklist_record_id: checklistRecordId,
      }
      console.log(_params, 'S_CheckListRecord.complete _params--')
      const _completePromise = S_CheckListRecord.complete({ params: _params })
      const _timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), COMPLETE_TIMEOUT_MS)
      })
      const res = await Promise.race([_completePromise, _timeoutPromise])
      // console.log(res, 'resresres')
      if (draftId && _checkers && currentUser && _checkers.length > 1) {
        Alert.alert(t(`請注意，若部分題號已經有人答題，本次送出將不會覆蓋他人先前已送出的答案。`));
      }
      store.dispatch(setCurrentChecklistRecordDraft(null));
      setQuestions([])
      Alert.alert(t('作業已送出'))
      _shouldNavigate = true
    } catch (e) {
      console.error(e)
      Alert.alert(t('作業送出失敗，請稍後再試'))
    } finally {
      setSubmitLoading(false)
    }

    if (_shouldNavigate) {
      $_resetToCheckListAssignment({ initTabIndex: 2 })
    }
  }

  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerLeft: () => (
        <>
          <WsIconBtn
            testID="backButton"
            name={'md-arrow-back'}
            onPress={() => {
              // setPopupActive(true)
              // 260417-opt
              $_onHeaderLeftPress()
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
    setQuestions([])
    const _routes = navigation.getState()?.routes || []
    const _prevRoute = _routes[_routes.length - 2]
    if (
      _prevRoute?.name === 'CheckListAssignmentIntroduction' ||
      _prevRoute?.name === 'CheckListAssignmentIntroductionTemp'
    ) {
      navigation.navigate({
        name: _prevRoute.name,
        params: {
          ...(_prevRoute.params || {}),
          refreshCounter: Date.now()
        },
        merge: true
      })
      return
    }
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
      setQuestions(currentChecklistDraft)
    }
  }, [currentChecklistDraft])

  React.useEffect(() => {
    if (answers) {
      $_refreshTabItems()
    }
  }, [answers])

  React.useEffect(() => {
    if (currentChecklistDraft) {
      $_setNavigationOptions()
    }
  }, [currentChecklistDraft, remark])

  React.useEffect(() => {
    if (answersRiskHeader) {
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
    setRightOnPressIsDisabled(!(remark && remark.trim()))
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
                  paddingTop:8,
                  paddingBottom: 0,
                }}
              >
                <WsText size={24}
                  style={{ marginBottom: 4 }}>
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
              renderOnlyActiveScene={false}
              items={tabItems}
              index={tabIndex}
              setIndex={settabIndex}
              fixedContainerHeight={height}
            />
            <View
              style={{
                backgroundColor: $color.white,
                paddingBottom: Platform.OS === 'android' ? 32 : 0
              }}
            >
              <WsModalFooter
                btnLeftHidden={_todayDone ? true : false}
                btnLeftText={t('不需點檢')}
                btnLeftOnPress={() => {
                  setStateModal(true)
                }}
                btnRightText={_todayDone ? t('關閉') : t('完成')}
                btnRightOnPress={() => {
                  _todayDone ? $_goBack() : $_onHeaderRightPress()
                }}
                remind={t('注意，『完成』送出前，作業狀態維持『進行中』')}
              />
            </View>
          </>
        )}
      </SafeAreaView>

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
        <View
          style={{
            flex: 1,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <WsLoading
            type={'b'}
          />
        </View>
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
        <WsFlex style={[
          {
            flexWrap: 'nowrap',
            paddingTop: 16,
            paddingHorizontal: 16,
            maxWidth: width * 0.9,
          }
        ]}
        >
          <WsIcon
            name="md-info-outline"
            color={$color.danger}
            style={{
              marginRight: 6
            }}
            size={24}
          />
          <WsText
            color={$color.danger}
            style={{
            }}
            size={14}
          >{t('注意，送出後，將移除已回答題目的所有內容')}</WsText>
        </WsFlex>

        <WsState
          label={t('輸入備註')}
          labelIcon={'ws-outline-edit-pencil'}
          multiline={true}
          style={{
            padding: 16
          }}
          placeholder={t('請寫下不需點檢的原因與細部說明...')}
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
