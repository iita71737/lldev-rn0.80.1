import React from 'react'
import { Text, View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsBtn,
  WsBottomSheet,
  WsGradientButton,
  WsModal,
  WsState,
  WsSpec,
  WsLoading,
  WsSkeleton
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import moment from 'moment'
import { SafeAreaView } from 'react-native-safe-area-context'
import S_Checklist from '@/services/api/v1/checklist'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListQuestionVersion from '@/services/api/v1/checklist_question_version';
import { setCurrentChecklistRecordDraft, setCurrentCheckListQuestions } from '@/store/data'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_ConstantData from '@/services/api/v1/constant_data'

const Introduction = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes
  const currentLang = i18n.language

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentChecklistDraft = useSelector(state => state.data.currentChecklistRecordDraft)
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)

  // Params
  const {
    id,
    draftId,
    todayDone,
    subTabIndex,
    index
  } = route.params

  // State
  const [RightOnPressIsDisabled, setRightOnPressIsDisabled] = React.useState(true)
  const [constantData, setConstantData] = React.useState()

  const [noNeedToCheckBtnDisable, setNoNeedToCheckBtnDisable] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()
  const [submitLoading, setSubmitLoading] = React.useState(false)

  const [assignment, setAssignment] = React.useState()
  const [factoryTags, setFactoryTags] = React.useState()
  const [questions, setQuestions] = React.useState()
  const [loading, setLoading] = React.useState(true)

  // 取得存於API的RiskLevel & Score
  const $_fetchConstantData = async () => {
    try {
      const _params = {
        model: 'checklist',
        for: 'app'
      }
      const res = await S_ConstantData.index({
        params: _params
      })
      setConstantData(res.data)
    } catch (e) {
      console.error(e);
    }
  }

  const $_fetchApi = async () => {
    try {
      const _params = {
        id: id,
        lang: currentLang ? currentLang : undefined
      }
      const res = await S_ChecklistAssignment.show({
        params: _params
      })
      setAssignment(res)
      if (res.checklist) {
        const _checklistDetail = await S_Checklist.show({
          modelId: res.checklist.id
        })
        if (_checklistDetail &&
          _checklistDetail.factory_tags &&
          _checklistDetail.factory_tags.length > 0) {
          setFactoryTags(_checklistDetail.factory_tags)
        }
        const _params = {
          checklist_assignment: id,
          checklist_version_id: res.checklist_version.id,
          schedule_setting_id: res.general_schedule_setting.id,
          checklist_record_draft: draftId ? draftId : undefined,
          get_all: 1
        }
        console.log(_params, 'IndexByScheduleSetting Params');
        const _checklistQuestionVersion = await S_CheckListQuestion.IndexByScheduleSettingV3({
          params: _params
        })
        // VALIDATE CAN RECORD OR NOT
        let _validateNoNeedToCheck = S_CheckListQuestion.validateNoNeedToCheck(_checklistQuestionVersion.data)
        setNoNeedToCheckBtnDisable(_validateNoNeedToCheck)
        // FORMATTED FOR VIEW
        let _formattedQuestions = await S_CheckListQuestion.formattedQuestion001(_checklistQuestionVersion.data)
        setQuestions(_formattedQuestions)
        setLoading(false)
      }
    } catch (e) {
      Alert.alert(t('伺服器忙碌中，請稍候再試'))
      navigation.goBack()
      console.error(e, 'e');
      // if (currentPreloadChecklistAssignment && currentPreloadChecklistAssignment[index] && currentPreloadChecklistAssignment[index].assignment) {
      //   const _assignment = currentPreloadChecklistAssignment[index].assignment
      //   setAssignment(_assignment)
      //   setLoading(false)
      // }
    }
  }

  // FUNC
  const $_onProcedurePress = () => {
    navigation.push('RoutesCheckList', {
      screen: 'CheckListAssignmentPreview',
      params: {
        id: assignment && assignment.checklist ? assignment.checklist.id : null,
        versionId: assignment && assignment.checklist && assignment.checklist.last_version ? assignment.checklist.last_version.id : null,
        _checklist_assignment_id: id,
        _reviewers: assignment.reviewers ? assignment.reviewers : null,
        _checkers: assignment.checkers ? assignment.checkers : null,
        assignment: assignment,
        _questions: questions ? questions : currentPreloadChecklistAssignment && currentPreloadChecklistAssignment[index] && currentPreloadChecklistAssignment[index]?.questions ? currentPreloadChecklistAssignment[index].questions : [],
        _draftId: draftId ? draftId : null,
        _todayDone: todayDone ? true : false,
        _constantData: constantData ? constantData : null,
        subTabIndex: subTabIndex ? subTabIndex : 0,
        index: index
      }
    })
  }

  // SUBMIT
  const $_onHeaderRightPress = async () => {
    // 過濾填答者為自己 或 無指定答題者的題目
    const _formattedQuestions = await S_CheckListRecord.formattedQuestionsForAPI(
      currentChecklistDraft ? currentChecklistDraft : questions,
      currentUser.id
    )
    // 整理成送出API的格式
    const _submitValue = S_CheckListRecord.setSubmitValue(
      assignment.checklist,
      currentUser.id,
      currentFactory.id,
      currentChecklistDraft,
      assignment.checklist.last_version,
      questions,
      _formattedQuestions,
      draftId,
      assignment.id,
      remark,
      status,
      remarkImages,
      assignment.reviewers,
    )
    console.log(JSON.stringify(_submitValue), '_submitValue=');
    try {
      const res = await S_CheckListRecordAns.batchStoreV2({ params: _submitValue })
        .then(res => {
          // Alert.alert(res, t('作業送出成功'))
          store.dispatch(setCurrentChecklistRecordDraft(null))
        })
        .catch(err => {
          Alert.alert(t('作業送出發生錯誤'))
        })
    } catch (e) {
      console.error(e);
      Alert.alert(t('作業送出發生錯誤'))
      store.dispatch(setCurrentChecklistRecordDraft(null))
    }
    setSubmitLoading(false)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
        }
      ],
      key: null
    })
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入Intro頁');
      $_fetchConstantData()
      $_fetchApi()
    });

    return unsubscribe;
  }, [navigation, id]);

  React.useEffect(() => {
    if (remark && remark.trim()) {
      setRightOnPressIsDisabled(false)
    } else {
      setRightOnPressIsDisabled(true);
    }
  }, [remark]);

  return (
    <>
      {loading ? (
        <>
          <WsSkeleton />
        </>
      ) : submitLoading ? (
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
      ) : (
        <>
          <ScrollView
            style={{
              backgroundColor: $color.white
            }}>
            {assignment && assignment.checklist && (
              <>
                <WsPaddingContainer>
                  <WsText size={24}
                    style={{ marginBottom: 16 }}>
                    {assignment.checklist.name}
                  </WsText>
                  <WsFlex
                    flexWrap={'wrap'}
                    style={{ marginBottom: 24 }}
                  >
                    {assignment.checklist.system_subclasses.map((subClass, subClassIndex) => {
                      return (
                        <WsTag
                          style={{
                            marginRight: 8,
                            marginBottom: 8
                          }}
                          key={`subClass${subClassIndex}`}
                          img={subClass.icon}>
                          {t(subClass.name)}
                        </WsTag>
                      )
                    })}
                  </WsFlex>

                  {assignment.record_at && (
                    <WsSpec
                      labelWidth={60}
                      titleSize={14}
                      fontWeight={600}
                      fontSize={14}
                      style={{
                        marginTop: 8,
                      }}
                      title={t('期限')}>
                      {moment(assignment.record_at).format('YYYY-MM-DD')}
                    </WsSpec>
                  )}

                  {assignment &&
                    assignment.start_time &&
                    assignment.end_time && (
                      <>
                        <WsSpec
                          titleSize={14}
                          fontWeight={600}
                          fontSize={14}
                          labelWidth={60}
                          style={{
                            marginTop: 8,
                          }}
                          title={t('時段')}>
                          {`${moment(assignment.start_time).format('HH:mm')}-${moment(assignment.end_time).format('HH:mm')}`}
                        </WsSpec>
                      </>
                    )}


                  {assignment &&
                    assignment.checkers && (
                      <WsInfo
                        style={{
                          marginTop: 16
                        }}
                        type="users"
                        label={t('答題者')}
                        value={assignment.checkers}
                        isUri={true}
                      />
                    )}

                  {assignment &&
                    assignment.reviewers && (
                      <WsInfo
                        style={{
                          marginTop: 16,
                        }}
                        type="users"
                        label={t('覆核者')}
                        isUri={true}
                        value={assignment.reviewers}
                      />
                    )}

                  {factoryTags && factoryTags.length > 0 && (
                    <WsInfo
                      style={{
                        marginTop: 8
                      }}
                      type="tags"
                      label={t('標籤')}
                      value={factoryTags}
                    />
                  )}

                </WsPaddingContainer>
              </>
            )}
          </ScrollView>
          <View
            style={{
              paddingBottom: 16,
              backgroundColor: $color.white
            }}>
            {!todayDone && (
              <TouchableOpacity
                style={{
                  marginHorizontal: 8,
                  marginBottom: 16,
                  alignItems: 'center',
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  backgroundColor: noNeedToCheckBtnDisable ? $color.white2d : $color.white,
                  borderColor: noNeedToCheckBtnDisable ? $color.white2d : $color.primary,
                  borderWidth: 1,
                  borderRadius: 25,
                  height: 48
                }}
                disabled={noNeedToCheckBtnDisable}
                onPress={() => {
                  setStateModal(true)
                }}>
                <WsText
                  color={noNeedToCheckBtnDisable ? $color.gray : $color.primary}>
                  {t('不需點檢')}
                </WsText>
              </TouchableOpacity>
            )}
            <WsGradientButton
              testID={'開始'}
              disabled={loading}
              borderRadius={30}
              onPress={$_onProcedurePress}
              style={{
                marginBottom: 8
              }}
            >
              {todayDone ? t('查看') : t('開始')}
            </WsGradientButton>
          </View>
          <WsModal
            visible={stateModal}
            onBackButtonPress={() => {
              setStateModal(false)
            }}
            headerLeftOnPress={() => {
              setStateModal(false)
            }}
            headerRightText={t('送出')}
            RightOnPressIsDisabled={RightOnPressIsDisabled}
            headerRightOnPress={() => {
              setSubmitLoading(true)
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
              placeholder={t('請寫下不需點檢的原因與細部說明')}
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
              type="Ll_filesAndImages"
              label={t('圖片')}
              labelIcon={'md-photo'}
              value={remarkImages}
              onChange={$event => {
                setRemarkImages($event)
              }}
              modelName="checklist_record_answer"
            // uploadUrl={`factory/${currentFactory.id}/checklist_record_answer/image`}
            />
          </WsModal>
        </>
      )}
    </>
  )
}

export default Introduction
