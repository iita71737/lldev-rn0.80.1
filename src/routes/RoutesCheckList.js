import React from 'react'
import { useSelector } from 'react-redux'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsStepRoutesCreate, WsStepRoutesUpdate, WsIcon, WsIconBtn } from '@/components'
import ViewCheckList from '@/views/CheckList/Index'
import ViewCheckListShow from '@/views/CheckList/Show'
import ViewCheckListRecordShow from '@/views/CheckListRecord/Show'
// import ViewCheckListPersonUpdate from '@/views/CheckList/Update/Person'
import ViewCheckListQuestionShow from '@/views/CheckListQuestionTemplate/Show'
import ViewCheckListQuestionRecordAnswerShow from '@/views/CheckListRecord/RecordAnswerShow'
import ViewCheckListAnswerShow from '@/views/CheckList/CheckListAnswer/Show'
import ViewCheckListItemRecord from '@/views/CheckListRecord/IndexOnSystemClass'
import ViewCheckListPickTemplate from '@/views/CheckList/Create/PickTemplate'
import ViewStepTwo from '@/views/CheckList/Create/StepTwo'
import ViewStepThree from '@/views/CheckList/Create/StepThree'
import ViewCheckListAssignment from '@/views/CheckListAssignment/Index'
import ViewCheckListAssignmentIntroduction from '@/views/CheckListAssignment/Update/Introduction'
import ViewCheckListAssignmentIntroductionTemp from '@/views/CheckListAssignment/Update/IntroductionTemp'
import ViewCheckListAssignmentPreview from '@/views/CheckListAssignment/Update/Preview'
import ViewCheckListAssignmentProcedure from '@/views/CheckListAssignment/Update/Procedure'
import ViewCheckListAssignmentPassStandard from '@/views/CheckListAssignment/PassStandard'
import ViewCheckListAssignmentShow from '@/views/CheckListAssignment/Show'
import ViewCheckListReviewShow from '@/views/CheckListReview/Show'
import ViewUpdateStepTwo from '@/views/CheckList/Update/StepTwo'
import ViewUpdateStepThree from '@/views/CheckList/Update/StepThree'
import ViewSortedQuestion from '@/views/CheckList/SortedQuestion'
import ViewUpdateTemplate from '@/views/CheckList/Update/CheckListTemplate'
import CheckListReviewResultShow from '@/views/CheckListReview/CheckListReviewResultShow'
import $option from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import S_Checklist from '@/services/api/v1/checklist'
import ViewGeneralScheduleSettingShow from '@/views/CheckList/GeneralScheduleSetting/Show'
import ViewRelatedChecklistAssignment from '@/views/CheckListAssignment/RelatedChecklistAssignment'
import ViewCheckListTemplateShow from '@/views/CheckList/Template/CheckListTemplateShow'
import ViewCheckListQuestionTemplateVersionShow from '@/views/CheckList/Template/CheckListQuestionTemplateVersion/CheckListQuestionTemplateVersionShow'

const StackSetting = createStackNavigator()

const RoutesCheckList = () => {
  const { t, i18n } = useTranslation()

  // REDUX
  const factory = useSelector(state => state.data.currentFactory)

  const expired_before_days_obj = days => {
    const _arr = []
    for (var i = 1; i <= days; i++) {
      const item = { label: i + '天', value: i }
      _arr.push(item)
    }
    return _arr
  }

  const expired_before_days_obj_for_week = () => {
    const _arr = [
      { label: '星期日', value: 0 },
      { label: '星期一', value: 1 },
      { label: '星期二', value: 2 },
      { label: '星期三', value: 3 },
      { label: '星期四', value: 4 },
      { label: '星期五', value: 5 },
      { label: '星期六', value: 6 }
    ]
    return _arr
  }

  const stepSettings = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.checklist_template &&
          fieldsValue.checklist_template.show_fields
        ) {
          return ['name', ...fieldsValue.checklist_template.show_fields]
        } else {
          return [
            'checklist_template',
            'name',
            'checkers',
            'reviewers',
            'owner',
            'frequency',
            'expired_before_days',
            'system_subclasses'
          ]
        }
      }
    },
    {
      component: ViewStepTwo
    },
    {
      component: ViewSortedQuestion
    },
    {
      component: ViewStepThree
    }
  ]

  const updateStepSettings = [
    {
      // showFields: ['event_type', 'name', 'remark', 'occur_at', 'system_subclasses',],
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.audit_template &&
          fieldsValue.audit_template.show_fields
        ) {
          return ['name', ...fieldsValue.audit_template.show_fields]
        } else {
          return [
            'checklist_template',
            'name',
            'checkers',
            'reviewers',
            'owner',
            'frequency',
            'expired_before_days',
            'system_subclasses'
          ]
        }
      }
    },
    {
      component: ViewUpdateStepTwo
    },
    {
      component: ViewSortedQuestion
    },
    {
      component: ViewUpdateStepThree
    }
  ]

  const updateVersionStepSettings = [
    {
      // showFields: ['event_type', 'name', 'remark', 'occur_at', 'system_subclasses',],
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.audit_template &&
          fieldsValue.audit_template.show_fields
        ) {
          return ['name', ...fieldsValue.audit_template.show_fields]
        } else {
          return [
            'checklist_template',
            'name',
            'checkers',
            'reviewers',
            'frequency',
            'expired_before_days',
            'system_subclasses'
          ]
        }
      }
    },
    {
      component: ViewUpdateTemplate
    },
    {
      component: ViewSortedQuestion
    },
    {
      component: ViewUpdateStepThree
    }
  ]

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }}>
      <StackSetting.Screen
        name="CheckList"
        component={scopeFilterScreen('checklist-read', ViewCheckList)}
        options={({ navigation }) => ({
          title: t('日常自檢'),
          // headerShown: false,
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}
      >
      </StackSetting.Screen>
      <StackSetting.Screen
        name="CheckListShow"
        component={scopeFilterScreen('checklist-read', ViewCheckListShow)}
        options={({ navigation }) => ({
          title: t('點檢表'),
          ...$option.headerOption
        })}>
      </StackSetting.Screen>
      <StackSetting.Screen
        name="CheckListRecordShow"
        component={scopeFilterScreen(
          'checklist-read',
          ViewCheckListRecordShow
        )}
        options={({ navigation, route }) => ({
          title: t('點檢記錄'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      {/* <StackSetting.Screen
        name="CheckListPersonUpdate"
        component={scopeFilterScreen(
          'checklist-update',
          ViewCheckListPersonUpdate
        )}
        options={({ navigation, route }) => ({
          title: t('編輯填表設定'),
          ...$option.headerOption
        })}></StackSetting.Screen> */}
        
      <StackSetting.Screen
        name="CheckListQuestionShow"
        component={scopeFilterScreen(
          'checklist-read',
          ViewCheckListQuestionShow
        )}
        options={({ navigation, route }) => ({
          title: t('題目詳情'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListQuestionRecordAnswerShow"
        component={scopeFilterScreen(
          'checklist-read',
          ViewCheckListQuestionRecordAnswerShow
        )}
        options={({ navigation, route }) => ({
          title: t('題目詳情'),
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          )
        })}
      >
      </StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAnswerShow"
        component={scopeFilterScreen(
          'checklist-read',
          ViewCheckListAnswerShow
        )}
        options={({ navigation, route }) => ({
          title: t('答題結果'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListPickTemplate"
        component={scopeFilterScreen(
          'checklist-create',
          ViewCheckListPickTemplate
        )}
        options={({ navigation, route }) => ({
          title: t('新增點檢表'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      {/* <StackSetting.Screen
        name="CheckListCreate"
        component={scopeFilterScreen('checklist-create', WsStepRoutesCreate)}
        options={{
          title: t('新增點檢表'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'CheckListCreate',
          title: t('新增點檢表'),
          modelName: 'checklist',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'CheckList',
          parentId: factory ? factory.id : null
        }}></StackSetting.Screen> */}

      {/* <StackSetting.Screen
        name="CustomizeCheckListCreate"
        component={scopeFilterScreen('checklist-create', WsStepRoutesCreate)}
        options={{
          title: t('新增自訂點檢表'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'CheckListCreate',
          title: t('新增自訂點檢表'),
          modelName: 'checklist',
          fields: customize_fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'CheckList',
          parentId: factory ? factory.id : null
        }}></StackSetting.Screen> */}

      {/* <StackSetting.Screen
        name="CheckListUpdate"
        component={scopeFilterScreen([
          'checklist-update-creator',
          'checklist-update-owner',
          'checklist-update',
        ], WsStepRoutesUpdate)}
        options={{
          title: t('編輯點檢表'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'CheckListUpdate',
          title: t('編輯點檢表'),
          modelName: 'checklist',
          fields: fields,
          stepSettings: updateStepSettings,
          afterFinishingTo: 'CheckListShow',
          parentId: factory ? factory.id : null
        }}></StackSetting.Screen> */}

      {/* <StackSetting.Screen
        name="CheckListTemplateUpdate"
        component={scopeFilterScreen(
          [
            'checklist-update-creator',
            'checklist-update-owner',
            'checklist-update',
          ],
          ViewUpdateTemplate
        )}
        options={({ navigation, route }) => ({
          title: t('更新點檢表'),
          ...$option.headerOption
        })}
        initialParams={{
          mode: 'updateVersion',
          name: 'CheckListUpdate',
          title: t('更新點檢表版本'),
          modelName: 'checklist',
          fields: fields,
          stepSettings: updateVersionStepSettings,
          afterFinishingTo: 'CheckListShow',
          parentId: factory ? factory.id : null
        }}></StackSetting.Screen> */}

      <StackSetting.Screen
        name="CheckListItemRecord"
        component={scopeFilterScreen('checklist-read', ViewCheckListItemRecord)}
        options={({ navigation, route }) => ({
          title: t('點檢記錄'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAssignmentIntroduction"
        component={scopeFilterScreen('checklist-record-checker', ViewCheckListAssignmentIntroduction)}
        options={({ navigation, route }) => ({
          title: `${t('點檢作業')}`,
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}
      >
      </StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAssignmentIntroductionTemp"
        component={scopeFilterScreen('checklist-record-checker', ViewCheckListAssignmentIntroductionTemp)}
        options={({ navigation, route }) => ({
          title: `${t('點檢作業')}-${t('臨時作答')}`,
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}>
      </StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAssignmentPreview"
        component={scopeFilterScreen('checklist-record-checker', ViewCheckListAssignmentPreview)}
        options={({ navigation, route }) => ({
          title: t('點檢作業'),
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAssignmentProcedure"
        component={scopeFilterScreen('checklist-record-manager', ViewCheckListAssignmentProcedure)}
        options={({ navigation, route }) => ({
          headerShown: false,
          gestureEnabled: false,
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAssignmentPassStandard"
        component={ViewCheckListAssignmentPassStandard}
        options={({ navigation, route }) => ({
          title: t('查看合規標準'),
          ...$option.headerOption
        })}></StackSetting.Screen>
      <StackSetting.Screen
        name="CheckListAssignmentShow"
        component={scopeFilterScreen(
          'checklist-read',
          ViewCheckListAssignmentShow
        )}
        options={({ navigation, route }) => ({
          title: t('點檢結果'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListAssignment"
        component={scopeFilterScreen(
          'checklist-record-manager',
          ViewCheckListAssignment
        )}
        options={({ navigation, route }) => ({
          title: t('點檢作業'),
          ...$option.headerOption,
          gestureEnabled: false,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListReviewResultShow"
        component={scopeFilterScreen('checklist-review-record', CheckListReviewResultShow)}
        options={({ navigation, route }) => ({
          title: t('覆核作業'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListReviewShow"
        component={scopeFilterScreen('checklist-read', ViewCheckListReviewShow)}
        options={({ navigation, route }) => ({
          title: t('點檢結果'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="ViewCheckListReviewed"
        component={scopeFilterScreen('checklist-review-record', CheckListReviewResultShow)}
        options={({ navigation, route }) => ({
          title: t('覆核結果'),
          ...$option.headerOption
        })}></StackSetting.Screen>

      <StackSetting.Screen
        name="GeneralScheduleSettingShow"
        component={scopeFilterScreen('checklist-read', ViewGeneralScheduleSettingShow)}
        options={({ navigation, route }) => ({
          title: t('排程'),
          ...$option.headerOption
        })}>
      </StackSetting.Screen>

      <StackSetting.Screen
        name="RelatedChecklistAssignment"
        component={scopeFilterScreen('checklist-read', ViewRelatedChecklistAssignment)}
        options={({ navigation, route }) => ({
          title: t('點檢作業'),
          ...$option.headerOption
        })}>
      </StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListTemplateShow"
        component={scopeFilterScreen('checklist-read', ViewCheckListTemplateShow)}
        options={({ navigation }) => ({
          title: t('點檢表公版內頁'),
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}
      >
      </StackSetting.Screen>

      <StackSetting.Screen
        name="CheckListQuestionTemplateVersionShow"
        component={scopeFilterScreen('checklist-read', ViewCheckListQuestionTemplateVersionShow)}
        options={({ navigation, route }) => ({
          title: t('公版題目詳情'),
          ...$option.headerOption
        })}></StackSetting.Screen>

    </StackSetting.Navigator>
  )
}

export default RoutesCheckList
