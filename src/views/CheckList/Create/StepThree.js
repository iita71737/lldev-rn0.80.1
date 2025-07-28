import React, { useEffect } from 'react'
import { ScrollView, Text, View, Modal } from 'react-native'
import {
  WsInfoForm,
  WsBtn,
  WsText,
  WsFlex,
  WsIcon,
  WsTag,
  WsIconBtn,
  LlInfoUserCard001,
  WsPaddingContainer,
  WsTabView,
  WsSkeleton,
  LlQuestionPickTemplate,
  LlCheckListQuestionCard003,
  WsLoading,
  WsModal
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import S_CheckList from '@/services/api/v1/checklist'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_systemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CheckListQuestion from '@/sections/CheckList/CheckListQuestion'

const CheckListStepThree = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { name, fields } = route.params

  // Fields
  const quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
      editable: false,
      rules: 'required'
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ],
      disabled: true
    },
    spec_limit_lower: {
      label: t('Control Limit (管制界線) 下限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      placeholder: t('管制界線下限'),
      editable: false
    },
    spec_limit_upper: {
      label: t('Control Limit (管制界線) 上限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      placeholder: t('管制界線上限'),
      editable: false
    },
    control_limit_lower: {
      label: `${t('Spec Limit (合規界線)')} ${t('下限')}`,
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      placeholder: t('合規界線下限'),
      editable: false
    },
    control_limit_upper: {
      label: `${t('Spec Limit (合規界線)')} ${t('下限')}`,
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      placeholder: t('合規界線上限'),
      editable: false
    },
    remark: {
      info: true,
      label: (
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsIcon
            name={'ws-outline-reminder'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('合規標準')}
          </WsText>
        </View>
      )
    },
    article_versions: {
      label: (
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsIcon
            name={'ll-nav-law-outline'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('法規依據')}
          </WsText>
        </View>
      ),
      title: t('法規依據'),
      type: 'info_listWithModal'
    },
    ocap_remark: {
      label: 'OCAP',
      multiline: true,
      placeholder: t('請輸入OCAP說明'),
      editable: false
    },
    attaches: {
      info: true,
      type: 'filesAndImages',
      label: t('附件')
    }
  }

  // redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentCheckListCreateData = useSelector(
    state => state.data.currentCheckListCreateData
  )

  // States
  const [checklist, setChecklist] = React.useState()
  const [quesWithTemplate, setQuesWithTemplate] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const [submitLoading, setSubmitLoading] = React.useState(false)

  // Storage
  const $_getStorage = async () => {
    setChecklist(currentCheckListCreateData)
  }

  // Services
  const $_putApi = async () => {
    // 建立點檢表
    const _checklistData = S_CheckList.getFormattedChecklistDataForCreate(
      currentCheckListCreateData
    )
    const result = await S_CheckList.create({
      parentId: factoryId,
      data: _checklistData
    })
    // 建立點檢表版本
    const _versionData = {
      checklist_template_version:
        currentCheckListCreateData.checklist_template.last_version.id,
      checklist_question_templates: currentCheckListCreateData.selectedQuestions
        ? S_CheckList.getFormattedDataWithIdForVersionData(
          currentCheckListCreateData.selectedQuestions
        )
        : null
    }
    const checklistVersion = await S_CheckListVersion.createVersion({
      checklistId: result.id,
      data: _versionData
    })
    $_createQuesWithVersion(result.id, checklistVersion.id)
  }

  // 建立所有題目
  const $_createQuesWithVersion = async (checklistId, versionId) => {
    const _allQues = S_CheckList.getAllFormattedQuestionsForCreate(
      currentCheckListCreateData.checklist_question_with_version,
      checklistId,
      versionId,
      factoryId
    )
    const res = await S_CheckList.createAllQuesWithVersion(_allQues)
    const resIds = res.map(ques => ques.data.data.id)
    $_updateVersionQues(resIds, versionId, _allQues)
  }

  const $_updateVersionQues = async (quesIds, versionId, _allQues) => {
    const questions = S_CheckList.getSortQues(quesIds, _allQues)
    const version = {
      questions: questions,
      factory: factoryId
    }
    await S_CheckList.updateVersion(versionId, version)
    setSubmitLoading(false)
  }

  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16
              }}
              onPress={$_onHeaderRightPress}>
              {t('送出')}
            </WsBtn>
          </>
        )
      },
      headerLeft: () => (
        <>
          <WsIconBtn
            name={'md-arrow-back'}
            onPress={$_onHeaderLeftPress}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }

  const $_onHeaderRightPress = async () => {
    setSubmitLoading(true)
    await $_putApi()
    setTimeout(() => {
      navigation.navigate('CheckList', {
        checklistCreateDone: true
      })
    }, 0)
  }

  const $_onHeaderLeftPress = () => {
    navigation.goBack()
  }

  const $_getSelectedQuestions = () => {
    setQuesWithTemplate(currentCheckListCreateData.selectedQuestions)
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions()
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [quesWithTemplate])

  useEffect(() => {
    if (currentCheckListCreateData) {
      $_getSelectedQuestions()
    }
  }, [currentCheckListCreateData])

  return (
    <>
      {submitLoading ? (
        <Modal visible={submitLoading} transparent={true}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: $color.white2d,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <WsLoading type="default"></WsLoading>
          </View>
        </Modal>
      ) : (
        <ScrollView>
          {checklist && (
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
                    {checklist.name}
                  </WsText>
                </WsFlex>
                <WsFlex
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}>
                  {checklist.system_subclasses && (
                    <>
                      {checklist.system_subclasses.map(
                        (systemSubclass, systemSubclassIndex) => {
                          return (
                            <WsTag
                              key={systemSubclassIndex}
                              style={{
                                marginTop: 16,
                                marginRight: 8
                              }}
                              img={systemSubclass.icon}>
                              {systemSubclass.name}
                            </WsTag>
                          )
                        }
                      )}
                    </>
                  )}
                </WsFlex>
              </WsPaddingContainer>
              <LlInfoUserCard001
                expired_before_days={
                  checklist.expired_before_days
                    ? checklist.expired_before_days
                    : null
                }
                frequency={checklist.frequency}
                checkers={checklist.checkers ? checklist.checkers : t('無')}
                reviewers={checklist.reviewers ? checklist.reviewers : t('無')}
                owner={checklist.owner ? checklist.owner : t('無')}
                fields={fields}
                onPress={() => {
                  $_onEditPress()
                }}
                style={{
                  marginVertical: 8
                }}
              />
              {loading ? (
                <>
                  <WsSkeleton />
                  <WsSkeleton />
                  <WsSkeleton />
                </>
              ) : (
                <>
                  {quesWithTemplate &&
                    quesWithTemplate.map((question, questionIndex) => {
                      return (
                        <View key={questionIndex}>
                          <LlCheckListQuestionCard003
                            style={{
                              marginTop: 8
                            }}
                            no={questionIndex + 1}
                            title={
                              question.last_version.title
                                ? question.last_version.title
                                : ''
                            }
                            des={
                              question.last_version.type === 'custom'
                                ? t('自訂題目')
                                : t('建議題目')
                            }
                            isFocus={
                              question.last_version.keypoint == 1 ? true : false
                            }
                            type={
                              question.last_version.type ? 'custom' : 'template'
                            }
                            value={question.last_version}
                            question={question}
                            fields={quesStateFields}
                          />
                        </View>
                      )
                    })}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}

    </>
  )
}

export default CheckListStepThree
