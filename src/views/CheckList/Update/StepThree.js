import React, { useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
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
  LlCheckListQuestionCard003
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import S_CheckList from '@/services/api/v1/checklist'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const CheckListUpdateStepThree = ({ route, navigation }) => {
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
      label: `${t('Spec Limit (合規界線)')} ${t('上限')}`,
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
    template_attaches: {
      info: true,
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`
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
    ocap_attaches: {
      info: true,
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`
    }
  }

  // redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentCheckListForEdit = useSelector(
    state => state.data.currentCheckListForEdit
  )

  // States
  const [checklist, setChecklist] = React.useState()
  const [quesWithTemplate, setQuesWithTemplate] = React.useState(
    currentCheckListForEdit.sortedQuestions
      ? currentCheckListForEdit.sortedQuestions
      : currentCheckListForEdit.selectedQuestions
  )
  const [loading, setLoading] = React.useState(true)

  // Storage
  const $_getStorage = () => {
    setChecklist(currentCheckListForEdit)
  }

  // Services
  const $_putApi = async () => {
    // 更新（編輯）點檢表
    const _checklistData = S_CheckList.getFormattedChecklistData(
      currentCheckListForEdit
    )
    const result = await S_CheckList.update({
      checklistId: currentCheckListForEdit.id,
      checklistData: _checklistData
    })

    // 建立點檢表版本
    const _versionData = {
      checklist_template_version:
        currentCheckListForEdit.checklist_template.last_version.id,
      checklist_question_templates:
        currentCheckListForEdit.checklist_question_with_version
          ? S_CheckList.formatDataWithIdForVersionData(
            currentCheckListForEdit.checklist_question_with_version
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
    const _allQues = S_CheckList.getAllFormattedQuestions(
      currentCheckListForEdit.sortedQuestions
        ? currentCheckListForEdit.sortedQuestions
        : currentCheckListForEdit.selectedQuestions,
      checklistId,
      versionId,
      factoryId
    )
    const res = await S_CheckList.createAllQuesWithVersion(_allQues)
    const resIds = res.map(ques => ques.data.data.id)
    $_updateVersionQues(resIds, versionId, _allQues)
  }

  // 更新點檢表版本
  const $_updateVersionQues = async (quesIds, versionId, _allQues) => {
    const questions = S_CheckList.getSortQuesUpdate(quesIds, _allQues)
    const version = {
      questions: questions,
      factory: factoryId
    }
    await S_CheckList.updateVersion(versionId, version)
  }

  // Function
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
    await $_putApi()
    setTimeout(() => {
      navigation.navigate('CheckList', {
        checklistUpdateDone: true
      })
    }, 0)
  }

  const $_onHeaderLeftPress = () => {
    navigation.goBack()
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions()
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [quesWithTemplate])

  return (
    <>
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
                            {t(systemSubclass.name)}
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
                  : ''
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
                {quesWithTemplate.map((question, questionIndex) => {
                  return (
                    <View key={questionIndex}>
                      <LlCheckListQuestionCard003
                        style={{
                          marginTop: 8
                        }}
                        no={questionIndex + 1}
                        title={question.title ? question.title : ''}
                        des={
                          question.type === 'custom'
                            ? t('自訂題目')
                            : t('建議題目')
                        }
                        isFocus={question.keypoint == 1 ? true : false}
                        type={question.type ? 'custom' : 'template'}
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
    </>
  )
}

export default CheckListUpdateStepThree
