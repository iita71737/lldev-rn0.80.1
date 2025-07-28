import React from 'react'
import { useSelector } from 'react-redux'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import ViewAuditIndex from '@/views/Audit/Index'
import ViewAuditShow from '@/views/Audit/Show'
import ViewAuditQuestionShow from '@/views/AuditQuestion/Show'
import ViewAuditRecordsShow from '@/views/AuditRecord/Show'
import ViewAuditRecordsAnsShow from '@/views/Audit/AuditAnswer/Show'
import ViewPickTemplate from '@/views/Audit/Create/PickTemplate'
import ViewCreateStepTwo from '@/views/Audit/Create/StepTwo'
import ViewUpdateStepTwo from '@/views/Audit/Update/StepTwo'
import ViewCreateStepThree from '@/views/Audit/Create/StepThree'
import ViewUpdateStepThree from '@/views/Audit/Update/StepThree'
import ViewUpdateAuditTemplate from '@/views/Audit/Update/AuditTemplate'
import ViewAuditAssignment from '@/views/Audit/Assignment/Index'
import ViewAuditAssignmentIntroduction from '@/views/Audit/Assignment/Update/Introduction'
import ViewAuditAssignmentProcedure from '@/views/Audit/Assignment/Update/Procedure'
import ViewAuditAssignmentPreview from '@/views/Audit/Assignment/Update/Preview'
import ViewAuditCreateRequest from '@/views/Audit/Create/Request'
import ViewAuditSortedQuestion from '@/views/Audit/SortedQuestion'
import ViewAuditeeQuestionShow from '@/views/Audit/Assignment/AuditeeQuestion'
import $option from '@/__reactnative_stone/global/option'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsSubtaskCard,
  WsText,
  LlAlertCard001,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import S_Task from '@/services/api/v1/task'
import moment from 'moment'
import ViewAuditTemplateShow from '@/views/Audit/Template/AuditTemplateShow'
import ViewAlertShow from '@/views/Alert/Show'
import ViewTaskShow from '@/views/Task/Show'

const StackSetting = createStackNavigator()
const RoutesAudit = () => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // 看板流程
  const fieldsCreateFromAlert = {
    name: {
      label: t('主旨'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: t('選擇'),
      rules: 'required',
      disabled: true
    },
    remark: {
      type: 'text',
      label: t('說明'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    taker: {
      type: 'belongsto',
      label: t('負責人'),
      placeholder: t('選擇'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    expired_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('期限'),
      rules: 'required',
      getMinimumDate: () => {
        return moment().format('YYYY-MM-DD')
      }
    },
    sub_tasks: {
      rules: 'at_least',
      type: 'models',
      fields: {
        name: {
          text: t('新增'),
          label: t('主旨'),
          autoFocus: true,
          rules: 'required'
        },
        remark: {
          label: t('說明'),
          rules: 'required'
        },
        taker: {
          type: 'belongsto',
          label: t('執行者'),
          nameKey: 'name',
          valueKey: 'id',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
          rules: 'required'
        },
        expired_at: {
          type: 'date',
          label: t('期限'),
          rules: 'requiredAndCompare'
        },
        attaches: {
          label: t('附件'),
          type: 'filesAndImages',
          uploadUrl: factory && factory.id ? `factory/${factory.id}/sub_task/attach` : null
        }
      },
      renderCom: WsSubtaskCard,
      renderItem: ({ item, itemIndex }) => {
        return (
          <WsSubtaskCard
            name={item.name}
            modalItem={item.name}
            fields={fields.sub_tasks.fields}
            value={item}
          />
        )
      },
    },
    apiAlert: {
      type: 'card',
      cardType: 'alert',
      info: true,
      label: t('相關警示') ? t('相關警示') : ('相關警示'),
      displayCheck(fieldsValue) {
        if (fieldsValue.apiAlert) {
          return true
        } else {
          return false
        }
      }
    },
    ll_broadcast: {
      type: 'card',
      cardType: 'broadcast',
      info: true,
      label: t('相關快報') ? t('相關快報') : ('相關快報'),
      displayCheck(fieldsValue) {
        if (fieldsValue.ll_broadcast) {
          return true
        } else {
          return false
        }
      }
    },
    relationEvent: {
      type: 'card',
      cardType: 'relativeEvent',
      info: true,
      label: t('相關事件') ? t('相關事件') : ('相關事件'),
      displayCheck(fieldsValue) {
        if (fieldsValue.relationEvent) {
          return true
        } else {
          return false
        }
      }
    }
  }

  const stepSettingsForTaskCreate = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.task_type &&
          fieldsValue.task_type.show_fields
        ) {
          return [
            'name',
            'system_subclasses',
            ...fieldsValue.task_type.show_fields
          ]
        } else {
          return [
            'name',
            'remark',
            'taker',
            'expired_at',
            'sub_tasks',
            'system_subclasses',
            'apiAlert',
            'relationEvent',
            'll_broadcast',
            'article_version'
          ]
        }
      }
    }
  ]

  // 新增稽核表欄位
  const fields = {
    audit_template: {
      type: 'belongsto',
      label: t('稽核表種類'),
      nameKey: 'name',
      modelName: 'audit_template',
      parentId: factory && factory.id,
      hasMeta: false,
      onPress: navigation => {
        navigation.navigate('AuditPickTemplate')
      },
      rules: 'required'
    },
    name: {
      label: t('名稱'),
      rules: 'required',
      autoFocus: true
    },
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    }
  }

  // 新增稽核表Step設定
  const stepSettings = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.audit_template &&
          fieldsValue.audit_template.show_fields
        ) {
          return ['name', ...fieldsValue.audit_template.show_fields]
        } else {
          return ['audit_template', 'name', 'owner']
        }
      }
    },
    {
      component: ViewCreateStepTwo
    },
    {
      component: ViewAuditSortedQuestion
    },
    {
      component: ViewCreateStepThree
    }
  ]

  // 編輯稽核表欄位
  const fieldsForEdit = {
    audit_template: {
      type: 'belongsto',
      label: t('稽核表種類'),
      nameKey: 'name',
      modelName: 'audit_template',
      parentId: factory && factory.id,
      hasMeta: false,
      editable: false
    },
    name: {
      label: t('稽核名稱'),
      rules: 'required',
      autoFocus: true
    },
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    system_subclasses: {
      label: t('領域'),
      placeholder: t('選擇'),
      type: 'modelsSystemClass',
      disabled: true
    }
  }
  // 編輯稽核表Step設定
  const updateStepSettings = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.audit_template &&
          fieldsValue.audit_template.show_fields
        ) {
          return ['name', ...fieldsValue.audit_template.show_fields]
        } else {
          return ['audit_template', 'name', 'owner', 'system_subclasses']
        }
      }
    },
    {
      component: ViewUpdateStepTwo
    },
    {
      component: ViewAuditSortedQuestion
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
        name="AuditIndex"
        component={scopeFilterScreen('audit-read', ViewAuditIndex)}
        options={({ navigation }) => ({
          title: t('稽核管理'),
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
      />
      <StackSetting.Screen
        name="AuditShow"
        component={scopeFilterScreen('audit-read', ViewAuditShow)}
        options={({ navigation }) => ({
          title: t('稽核表'),
          headerTitleAlign: 'right',
          ...$option.headerOption,
          ...TransitionPresets.SlideFromRightIOS,
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
      />
      <StackSetting.Screen
        name="AuditPickTemplate"
        component={scopeFilterScreen('audit-create', ViewPickTemplate)}
        options={({ navigation }) => ({
          headerTitleAlign: 'right',
          title: t('新增稽核表'),
          ...$option.headerOption,
          ...TransitionPresets.SlideFromRightIOS
        })}
      />
      <StackSetting.Screen
        name="AuditCreate"
        component={scopeFilterScreen('audit-create', WsStepRoutesCreate)}
        options={{
          title: t('新增稽核表'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'AuditCreate',
          title: t('新增稽核表'),
          modelName: 'audit',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'AuditIndex',
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="AuditUpdate"
        component={
          scopeFilterScreen(
            [
              'audit-update-creator',
              'audit-update-owner',
              'audit-update',
            ],
            WsStepRoutesUpdate
          )}
        options={({ navigation }) => ({
          title: t('編輯稽核表'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'AuditUpdate',
          title: t('編輯稽核表'),
          modelName: 'audit',
          fields: fieldsForEdit,
          stepSettings: updateStepSettings,
          afterFinishingTo: 'AuditShow',
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="AuditQuestionShow"
        component={scopeFilterScreen(
          'audit-read',
          ViewAuditQuestionShow
        )}
        options={({ navigation, route }) => ({
          title: t('查看題目'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="AuditRecordsShow"
        component={scopeFilterScreen('audit-read', ViewAuditRecordsShow)}
        options={({ navigation, route }) => ({
          title: t(''),
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
      />
      <StackSetting.Screen
        name="AuditRecordsAnsShow"
        component={scopeFilterScreen(
          'audit-read',
          ViewAuditRecordsAnsShow
        )}
        options={({ navigation, route }) => ({
          title: t('答題結果'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="UpdateAuditTemplate"
        component={scopeFilterScreen(
          'audit-read',
          ViewUpdateAuditTemplate
        )}
        options={({ navigation, route }) => ({
          title: t('更新題目'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="AuditAssignment"
        component={scopeFilterScreen('audit-record', ViewAuditAssignment)}
        options={({ navigation, route }) => ({
          title: t('稽核作業'),
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
      />
      <StackSetting.Screen
        name="AuditAssignmentIntroduction"
        component={scopeFilterScreen(
          'audit-record',
          ViewAuditAssignmentIntroduction
        )}
        options={({ navigation, route }) => ({
          title: `${t('稽核作業')}`,
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="AuditAssignmentPreview"
        component={scopeFilterScreen(
          'audit-record',
          ViewAuditAssignmentPreview
        )}
        options={({ navigation, route }) => ({
          title: t('稽核作業'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="AuditAssignmentProcedure"
        component={scopeFilterScreen(
          'audit-record',
          ViewAuditAssignmentProcedure
        )}
        options={({ navigation, route }) => ({
          title: t('稽核作業'),
          ...$option.headerOption,
          headerShown: false
        })}
      />
      <StackSetting.Screen
        name="AuditCreateRequest"
        component={scopeFilterScreen(
          'audit-record',
          ViewAuditCreateRequest
        )}
        options={({ navigation, route }) => ({
          title: t('建立稽核行程'),
          ...$option.headerOption,
        })}
      />
      <StackSetting.Screen
        name="AuditeeQuestion"
        component={scopeFilterScreen(
          'audit-read',
          ViewAuditeeQuestionShow
        )}
        options={({ navigation, route }) => ({
          title: t('查看題目'),
          ...$option.headerOption
        })}
      />

      <StackSetting.Screen
        name="AuditTemplateShow"
        component={ViewAuditTemplateShow}
        options={({ navigation }) => ({
          title: t('稽核表公版'),
          headerTitleAlign: 'right',
          ...$option.headerOption,
          ...TransitionPresets.SlideFromRightIOS,
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
      />

    </StackSetting.Navigator>
  )
}

export default RoutesAudit
