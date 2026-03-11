import React from 'react'
import { View, Dimensions, Alert } from 'react-native'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsSubtaskCard,
  WsText,
  LlAlertCard001,
  WsIconBtn,
  LlBatchEditBtn001
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import { createStackNavigator } from '@react-navigation/stack'
import ViewTaskIndex from '@/views/Task/Index'
import ViewTaskShow from '@/views/Task/Tasks/Show'
import ViewTaskTemplateShow from '@/views/Task/Template/Show'
import { useSelector } from 'react-redux'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { scopePermission } from '@/__reactnative_stone/global/permission'
import { useTranslation } from 'react-i18next'
import $option from '@/__reactnative_stone/global/option'
import S_Task from '@/services/api/v1/task'
import S_TaskFactoryTemplete from '@/services/api/v1/task_factory_template'
import moment from 'moment'
import store from '@/store'
import $color from '@/__reactnative_stone/global/color'
import {
  setOfflineMsg,
  setRefreshCounter
} from '@/store/data'
import ViewAlertShow from '@/views/Alert/Show'
import ViewCheckListRecordShow from '@/views/CheckListRecord/Show'
import ViewAuditRecordsShow from '@/views/AuditRecord/Show'
import ViewDashboardTask from '@/views/DashboardFactory/Task'
import ViewDashboardTaskList from '@/views/DashboardFactory/DashboardTaskListTab'
const StackSetting = createStackNavigator()

const RoutesTask = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUserScope = useSelector(state => state.data.userScopes);

  // state
  const subTaskScopeField = {
    type: 'picker',
    label: t('待辦執行者的待辦閱覽權限'),
    placeholder: t('選擇'),
    rules: 'required',
    items: [
      {
        label: t('依待辦領域'),
        value: 'system_subclass'
      },
      {
        label: t('限執行者'),
        value: 'taker'
      },
      {
        label: t('所有待辦'),
        value: 'all'
      }
    ]
  }
  const TaskSubtaskCard = (props) => (
    <WsSubtaskCard
      {...props}
      showMissingTakerWarning={true}
    />
  )

  // 建立任務
  const fields = {
    name: {
      label: t('主旨'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
      testID: '任務主旨'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: `${t('待辦無領域')}`,
      rules: 'required',
      testID: 'modelsSystemClass',
      disabled: true
    },
    users: {
      type: 'belongstomany',
      label: `${t('限閱人員')}`,
      nameKey: 'name',
      valueKey: 'id',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
    },
    roles: {
      type: 'multipleBelongstomany',
      label: t('限閱角色'),
      placeholder: t('選擇'),
      innerLabel: [t('預設角色'), t('自訂角色')],
      modelName: ['user_role', 'user_factory_role_template'],
      hasMeta: false,
      getAll: true,
      params: {
        get_all: 1
      },
      searchBarVisible: true
    },
    remark: {
      type: 'text',
      label: t('說明'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
      testID: '任務說明'
    },
    taker: {
      type: 'belongsto',
      label: t('負責人'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
    },
    expired_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('期限'),
      rules: 'required',
      getMinimumDate: () => {
        return moment().format('YYYY-MM-DD')
      },
    },
    factory_tags: {
      type: 'Ll_relatedTags',
      label: t('標籤'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'factory_tag',
      serviceIndexKey: 'indexV2',
      hasMeta: false,
      params: {
        lang: 'tw',
        order_by: 'sequence',
        order_way: 'asc',
        get_all: 1
      }
    },
    related_module: {
      type: 'Ll_relatedModule',
      label: t('相關資料'),
    },
    sub_task_scope: {
      ...subTaskScopeField
    },
    sub_tasks: {
      label: t('待辦事項'),
      rules: 'at_least|models_fields_required:taker',
      type: 'models',
      fields: {
        name: {
          text: t('新增'),
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        system_subclasses: {
          type: 'modelsSystemClass',
          label: t('領域'),
          placeholder: `${t('選擇')}`,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
          rules: 'required',
        },
        taker: {
          type: 'belongsto',
          label: `${t('執行者')}`,
          nameKey: 'name',
          valueKey: 'id',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
          rules: 'required',
          testID: '執行人員'
        },
        expired_at: {
          type: 'date',
          label: `${t('期限')}`,
          rules: 'requiredAndCompare',
          testID: '期限',
        },
        related_module: {
          type: 'Ll_relatedModule',
          label: t('相關資料'),
        },
        file_attaches: {
          modelName: 'task',
          label: `${t('附件')}`,
          type: 'Ll_filesAndImages',
          testID: 'Ll_filesAndImages'
        },
      },
      renderCom: TaskSubtaskCard,
      renderCom002Remind: t('注意，將會把現有待辦資料覆蓋'),
      renderCom002: LlBatchEditBtn001,
      renderCom002Label: t('批次編輯'),
      renderCom002Fields: {
        name: {
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
        },
        expired_at: {
          type: 'date',
          label: t('期限'),
          rules: 'requiredAndCompare',
        },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom003: LlBatchEditBtn001,
      renderCom003Label: t('排序'),
      modalTitle: t('待辦事項'),
      renderCom004Label: t('依任務來新增待辦'),
      updateValueOnChange: (event, value, field, fields) => {
        const _subTasks = Array.isArray(event) ? event : []
        const _subClassMap = new Map()
        _subTasks.forEach(subTask => {
          if (!Array.isArray(subTask?.system_subclasses)) {
            return
          }
          subTask.system_subclasses.forEach(subClass => {
            if (!subClass) {
              return
            }
            const _key = typeof subClass === 'object'
              ? subClass.id
              : String(subClass)
            if (_key && !_subClassMap.has(_key)) {
              _subClassMap.set(_key, subClass)
            }
          })
        })
        return {
          sub_tasks: _subTasks,
          system_subclasses: Array.from(_subClassMap.values())
        }
      },
    },
    apiAlert: {
      type: 'card',
      cardType: 'alert',
      info: true,
      label: t('相關警示'),
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
      label: t('相關快報'),
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
      label: t('相關事件'),
      displayCheck(fieldsValue) {
        if (fieldsValue.relationEvent) {
          return true
        } else {
          return false
        }
      }
    },
    article_version: {
      type: 'card',
      cardType: 'relativeArticle',
      info: true,
      label: t('相關法條'),
      displayCheck(fieldsValue) {
        if (fieldsValue.article_version) {
          return true
        } else {
          return false
        }
      }
    },
    act_version: {
      type: 'card',
      cardType: 'relativeAct',
      info: true,
      label: t('相關法規'),
      displayCheck(fieldsValue) {
        if (fieldsValue.act_version) {
          return true
        } else {
          return false
        }
      }
    },
    internal_training_group: {
      type: 'card',
      cardType: 'relativeTrainingGroup',
      info: true,
      label: t('相關教育訓練群組'),
      displayCheck(fieldsValue) {
        if (fieldsValue.internal_training_group) {
          return true
        } else {
          return false
        }
      }
    },
    guideline_version: {
      type: 'card',
      cardType: 'relativeGuidelineVersion',
      info: true,
      label: t('相關內規'),
      displayCheck(fieldsValue) {
        if (fieldsValue.guideline_version) {
          return true
        } else {
          return false
        }
      }
    },
    guideline_article_version: {
      type: 'card',
      cardType: 'relativeGuidelineArticle',
      info: true,
      label: t('相關內規層級條文'),
      displayCheck(fieldsValue) {
        if (fieldsValue.guideline_article_version) {
          return true
        } else {
          return false
        }
      }
    },
    redirect_routes: {
    },
  }

  // 從警示建立任務
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
    sub_task_scope: {
      ...subTaskScopeField
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
      rules: 'at_least|models_fields_required:taker',
      type: 'models',
      fields: {
        name: {
          text: t('新增'),
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
          rules: 'required',
        },
        taker: {
          type: 'belongsto',
          label: t('執行者'),
          nameKey: 'name',
          valueKey: 'id',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
          rules: 'required',
        },
        expired_at: {
          type: 'date',
          label: t('期限'),
          rules: 'requiredAndCompare',
          testID: '期限',
        },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom: TaskSubtaskCard,
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
      updateValueOnChange: (event, value, field, fields) => {
        const _subTasks = Array.isArray(event) ? event : []
        const _subClassMap = new Map()
        _subTasks.forEach(subTask => {
          if (!Array.isArray(subTask?.system_subclasses)) {
            return
          }
          subTask.system_subclasses.forEach(subClass => {
            if (!subClass) {
              return
            }
            const _key = typeof subClass === 'object'
              ? subClass.id
              : String(subClass)
            if (_key && !_subClassMap.has(_key)) {
              _subClassMap.set(_key, subClass)
            }
          })
        })
        return {
          sub_tasks: _subTasks,
          system_subclasses: Array.from(_subClassMap.values())
        }
      }
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
    },
  }

  // 編輯任務
  const fieldsForEdit = {
    name: {
      label: t('主旨'),
      rules: 'required'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      placeholder: t('選擇'),
      label: t('領域'),
      rules: 'required',
      disabled: true
    },
    sub_task_scope: {
      ...subTaskScopeField
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
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    expired_at: {
      type: 'date',
      label: t('期限'),
      rules: 'required'
    },
    factory_tags: {
      type: 'Ll_relatedTags',
      label: t('標籤'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'factory_tag',
      serviceIndexKey: 'indexV2',
      hasMeta: false,
      params: {
        lang: 'tw',
        order_by: 'sequence',
        order_way: 'asc',
        get_all: 1
      }
    },
    related_module: {
      type: 'Ll_relatedModule',
      label: t('相關資料'),
    },
    sub_tasks: {
      label: t('待辦事項'),
      rules: 'at_least|models_fields_required:taker',
      type: 'models',
      fields: {
        id: {
          displayCheck() {
            return false
          }
        },
        name: {
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
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
          rules: 'requiredAndCompare',
          testID: '期限',
        },
        related_module: {
          type: 'Ll_relatedModule',
          label: t('相關資料'),
        },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom: WsSubtaskCard,
      renderCom002Remind: t('注意，將會把現有待辦資料覆蓋'),
      renderCom002: LlBatchEditBtn001,
      renderCom002Label: t('批次編輯'),
      renderCom002Fields: {
        name: {
          label: t('主旨'),
          autoFocus: true,
        },
        remark: {
          label: t('說明'),
        },
        expired_at: {
          type: 'date',
          label: t('期限'),
          testID: '期限',
        },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom003: LlBatchEditBtn001,
      renderCom003Label: t('排序'),
      renderCom004Label: t('依任務來新增待辦'),
    },
    apiAlert: {
      type: 'card',
      cardType: 'alert',
      info: true,
      label: t('相關警示'),
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
      label: t('相關快報'),
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
      label: t('相關事件'),
      displayCheck(fieldsValue) {
        if (fieldsValue.relationEvent) {
          return true
        } else {
          return false
        }
      }
    },
    article_version: {
      type: 'card',
      cardType: 'relativeArticle',
      info: true,
      label: t('相關法條'),
      displayCheck(fieldsValue) {
        if (fieldsValue.article_version) {
          return true
        } else {
          return false
        }
      }
    },
  }

  // 編輯任務草稿
  const fieldsForEditDraft = {
    id: {
      displayCheck() {
        return false
      }
    },
    status: {
      displayCheck() {
        return false
      }
    },
    name: {
      label: t('主旨'),
      rules: 'required'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      placeholder: t('選擇'),
      label: t('領域'),
      rules: 'required',
      disabled: true
    },
    sub_task_scope: {
      ...subTaskScopeField
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
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    expired_at: {
      type: 'date',
      label: t('期限'),
      rules: 'required'
    },
    factory_tags: {
      type: 'Ll_relatedTags',
      label: t('標籤'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'factory_tag',
      serviceIndexKey: 'indexV2',
      hasMeta: false,
      params: {
        lang: 'tw',
        order_by: 'sequence',
        order_way: 'asc',
        get_all: 1
      }
    },
    related_module: {
      type: 'Ll_relatedModule',
      label: t('相關資料'),
    },
    sub_tasks: {
      label: t('待辦事項'),
      rules: 'at_least|models_fields_required:taker',
      type: 'models',
      fields: {
        id: {
          displayCheck() {
            return false
          }
        },
        name: {
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
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
          rules: 'requiredAndCompare',
          testID: '期限',
        },
        related_module: {
          type: 'Ll_relatedModule',
          label: t('相關資料'),
        },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom: WsSubtaskCard,
      renderCom002Remind: t('注意，將會把現有待辦資料覆蓋'),
      renderCom002: LlBatchEditBtn001,
      renderCom002Label: t('批次編輯'),
      renderCom002Fields: {
        name: {
          label: t('主旨'),
          autoFocus: true,
        },
        remark: {
          label: t('說明'),
        },
        expired_at: {
          type: 'date',
          label: t('期限'),
          testID: '期限',
        },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom003: LlBatchEditBtn001,
      renderCom003Label: t('排序'),
      renderCom004Label: t('依任務來新增待辦'),
      updateValueOnChange: (event, value, field, fields) => {
        const _subTasks = Array.isArray(event) ? event : []
        const _subClassMap = new Map()
        _subTasks.forEach(subTask => {
          if (!Array.isArray(subTask?.system_subclasses)) {
            return
          }
          subTask.system_subclasses.forEach(subClass => {
            if (!subClass) {
              return
            }
            const _key = typeof subClass === 'object'
              ? subClass.id
              : String(subClass)
            if (_key && !_subClassMap.has(_key)) {
              _subClassMap.set(_key, subClass)
            }
          })
        })
        return {
          sub_tasks: _subTasks,
          system_subclasses: Array.from(_subClassMap.values())
        }
      },
    },
    apiAlert: {
      type: 'card',
      cardType: 'alert',
      info: true,
      label: t('相關警示'),
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
      label: t('相關快報'),
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
      label: t('相關事件'),
      displayCheck(fieldsValue) {
        if (fieldsValue.relationEvent) {
          return true
        } else {
          return false
        }
      }
    },
    article_version: {
      type: 'card',
      cardType: 'relativeArticle',
      info: true,
      label: t('相關法條'),
      displayCheck(fieldsValue) {
        if (fieldsValue.article_version) {
          return true
        } else {
          return false
        }
      }
    },
  }

  // 任務公版
  const taskTemplateFields = {
    id: {
    },
    name: {
      label: t('主旨'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
    },
    remark: {
      type: 'text',
      label: t('說明'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
    },
    taker: {
      type: 'belongsto',
      label: t('負責人'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      // rules: 'required',
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: `${t('待辦無領域')}`,
      // rules: 'required',
      testID: 'modelsSystemClass',
      disabled: true
    },
    factory_tags: {
      type: 'Ll_relatedTags',
      label: t('標籤'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'factory_tag',
      serviceIndexKey: 'indexV2',
      hasMeta: false,
      params: {
        lang: 'tw',
        order_by: 'sequence',
        order_way: 'asc',
        get_all: 1
      }
    },
    links: {
      type: 'Ll_relatedModule',
      label: t('相關資料'),
    },
    subtask_factory_templates: {
      label: t('待辦事項'),
      rules: 'at_least',
      type: 'models',
      fields: {
        name: {
          text: t('新增'),
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
          rules: 'required',
        },
        taker: {
          type: 'belongsto',
          label: `${t('執行者')}`,
          nameKey: 'name',
          valueKey: 'id',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
        },
        system_subclasses: {
          type: 'modelsSystemClass',
          label: t('領域'),
          placeholder: `${t('選擇')}`,
          // rules: 'required', 260310-task
          testID: 'modelsSystemClass'
        },
        links: {
          type: 'Ll_relatedModule',
          label: t('相關資料'),
        },
        attaches: {
          modelName: 'subtask_factory_template',
          label: `${t('附件')}`,
          type: 'Ll_filesAndImages',
          testID: 'Ll_filesAndImages'
        },
      },
      renderCom: WsSubtaskCard,
      renderCom002Remind: t('注意，將會把現有待辦資料覆蓋'),
      renderCom002: LlBatchEditBtn001,
      renderCom002Label: t('批次編輯'),
      renderCom002Fields: {
        name: {
          label: t('主旨'),
          autoFocus: true,
          rules: 'required',
        },
        remark: {
          label: t('說明'),
        },
        // expired_at: {
        //   type: 'date',
        //   label: t('期限'),
        //   rules: 'requiredAndCompare',
        // },
        file_attaches: {
          modelName: 'task',
          label: t('附件'),
          type: 'Ll_filesAndImages',
        },
      },
      renderCom003: LlBatchEditBtn001,
      renderCom003Label: t('排序'),
      modalTitle: t('待辦事項'),
      renderCom004Label: t('依任務來新增待辦'),
      updateValueOnChange: (event, value, field, fields) => {
        const _subTasks = Array.isArray(event) ? event : []
        const _subClassMap = new Map()
        _subTasks.forEach(subTask => {
          if (!Array.isArray(subTask?.system_subclasses)) {
            return
          }
          subTask.system_subclasses.forEach(subClass => {
            if (!subClass) {
              return
            }
            const _key = typeof subClass === 'object'
              ? subClass.id
              : String(subClass)
            if (_key && !_subClassMap.has(_key)) {
              _subClassMap.set(_key, subClass)
            }
          })
        })
        return {
          subtask_factory_templates: _subTasks,
          system_subclasses: Array.from(_subClassMap.values())
        }
      },
    },
    status: {
      displayCheck() {
        return false
      }
    },
  }

  const stepSettings = [
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
            'sub_task_scope',
            'apiAlert',
            'relationEvent',
            'll_broadcast',
            'article_version',
            'act_version',
            'guideline_version',
            'guideline_article_version',
            'internal_training_group',
            'related_module',
            'factory_tags',
            'subtask_factory_templates',
            'links',
            'status',
            'users',
            'roles'
          ]
        }
      }
    }
  ]

  const $_resetToTaskShow = (navigation, taskId) => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: 'TaskIndex',
        },
        {
          name: 'TaskShow',
          params: {
            id: taskId
          }
        }
      ],
      key: null
    })
  }

  // 建立任務
  const submitForCreate = async (_postData, navigation, currentUserId) => {
    // console.log(JSON.stringify(_postData), '_postData');
    const _data = S_Task.getFormattedDataForCreate(_postData, currentUserId)
    console.log(JSON.stringify(_data), '_data');
    try {
      const res = await S_Task.create({
        data: _data
      })
      if (_postData.redirect_routes && res) {
        // 250327-測試後可行，reset有問題
        console.log('AAA')
        navigation.replace('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: res.id,
            refreshKey: Date.now()
          }
        })
        Alert.alert(t('任務已派發'))
      }
      else if (res.alert) {
        console.log('BBB')
        navigation.replace('RoutesAlert', {
          screen: 'AlertShow',
          params: {
            id: res.alert.id
          }
        })
      } else if (res && res.id) {
        const _resTakerId = res?.taker?.id
        const _currentUserId = currentUser?.id
        if (_resTakerId && _currentUserId && _resTakerId === _currentUserId) {
          $_resetToTaskShow(navigation, res.id)
          Alert.alert(t('任務已派發'))
        } else {
          navigation.goBack()
          Alert.alert(t('任務已派發'))
        }
      }
    } catch (e) {
      console.error(e.message, 'TaskCreate error')
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TaskIndex',
          }
        ],
        key: null
      })
    }
  }

  // 編輯任務
  const submitForEdit = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    // console.log(JSON.stringify(_formattedValue), '_formattedValue--');
    const _data = S_Task.getFormattedDataForEdit(_formattedValue, currentUserId)
    // console.log(JSON.stringify(_data), 'submitForEdit');
    try {
      const res = await S_Task.update({
        modelId: modelId,
        data: _data
      })
      $_resetToTaskShow(navigation, res.id)
      if (_data.status === '2') {
        setTimeout(() => {
          Alert.alert(t('任務已派發'))
        }, 50)
      } else {
        setTimeout(() => {
          Alert.alert(t('送出成功'))
        }, 50)
      }
    } catch (e) {
      console.error(e.message, 'submitForEdit')
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TaskIndex',
          },
        ],
        key: null
      })
    }
  }

  // 存儲任務草稿
  const onSubmitDraft = async (_postData, navigation, currentUserId) => {
    // console.log(_postData, '_postData---');
    const _data = S_Task.getFormattedDataForCreate(_postData, currentUserId)
    // console.log(JSON.stringify(_data), '_data!!');
    try {
      if (_data.status === '2') {
        const _modelId = _data?.id
        console.log(_modelId, '_modelIdQQQ');
        const res = await S_Task.updateDraft({
          modelId: _modelId,
          data: _data
        })
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'TaskIndex',
            }
          ],
          key: null
        })
        Alert.alert(
          t('草稿已暫存'),
          t('您可以至「看板頁面」的「我的任務」\n>「草稿」中查看或編輯。')
        )
      } else {
        const res = await S_Task.storeDraft({
          data: _data
        })
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'TaskIndex',
            }
          ],
          key: null
        })
        Alert.alert(
          t('草稿已暫存'),
          t('您可以至「看板頁面」的「我的任務」\n>「草稿」中查看或編輯。')
        )

      }
    } catch (e) {
      console.error(e.message, 'TaskCreate error')
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TaskIndex',
          }
        ],
        key: null
      })
    }
  }

  // 建立任務公版
  const submitForTemplateCreate = async (_postData, navigation, currentUserId) => {
    // console.log(JSON.stringify(_postData),'_postData')
    const _data = S_TaskFactoryTemplete.getFormattedData(_postData, currentUserId, factory?.id)
    // console.log(JSON.stringify(_data), '_data')
    try {
      const res = await S_TaskFactoryTemplete.create({
        data: _data
      })
      await AsyncStorage.removeItem('TaskTemplateCreate')
      $_resetToTaskTemplateShow(navigation, res.id)
      setTimeout(() => {
        Alert.alert(t('任務公版已建立'))
      }, 50)
    } catch (e) {
      console.error(e?.message, 'TaskTemplateCreate error')
      Alert.alert(t('建立失敗'))
    }
  }

  // 建立任務公版草稿
  const onSubmitTemplateCreateDraft = async (_postData, navigation, currentUserId) => {
    const _data = S_TaskFactoryTemplete.getFormattedData(_postData, currentUserId, factory?.id)
    try {
      await S_TaskFactoryTemplete.storeDraft({
        data: _data
      })
      await AsyncStorage.removeItem('TaskTemplateCreate')
      Alert.alert(t('草稿已暫存'))
      navigation.goBack()
    } catch (e) {
      console.error(e?.message, 'TaskTemplateCreateDraft error')
      Alert.alert(t('暫存失敗'))
    }
  }

  // 編輯任務公版草稿
  const onSubmitTemplateUpdateDraft = async (_postData, navigation, currentUserId) => {
    const _data = S_TaskFactoryTemplete.getFormattedData(_postData, currentUserId, factory?.id)
    try {
      if (!_data?.id) {
        Alert.alert(t('暫存失敗'))
        return
      }
      await S_TaskFactoryTemplete.updateDraft({
        modelId: _data.id,
        data: _data
      })
      await AsyncStorage.removeItem('TaskTemplateUpdate')
      await AsyncStorage.removeItem('TaskTemplateUpdateDraft')
      Alert.alert(t('草稿已暫存'))
      $_resetToTaskTemplateShow(navigation, _data.id)
    } catch (e) {
      console.error(e?.message, 'TaskTemplateUpdateDraft error')
      Alert.alert(t('暫存失敗'))
    }
  }

  const $_resetToTaskTemplateShow = (navigation, templateId) => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: 'TaskIndex',
          params: {
            _tabIndex: 1
          }
        },
        {
          name: 'TaskTemplateShow',
          params: {
            id: templateId,
            refreshKey: Date.now()
          }
        }
      ],
      key: null
    })
  }

  // 編輯任務公版
  const submitForTemplateEdit = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    const _data = S_TaskFactoryTemplete.getFormattedData(_formattedValue, currentUserId, factory?.id)
    try {
      const _isDraft = (_formattedValue?.status === 'draft') || (_data?.status === 'draft')
      const res = _isDraft
        ? await S_TaskFactoryTemplete.updateDraft({
          modelId: modelId,
          data: _data
        })
        : await S_TaskFactoryTemplete.update({
          modelId: modelId,
          data: _data
        })
      await AsyncStorage.removeItem('TaskTemplateUpdate')
      await AsyncStorage.removeItem('TaskTemplateUpdateDraft')
      $_resetToTaskTemplateShow(navigation, res.id)
      setTimeout(() => {
        Alert.alert(t('送出成功'))
      }, 50)
    } catch (e) {
      console.error(e?.message, 'submitForTemplateEdit')
      Alert.alert(t('送出失敗'))
    }
  }

  // 公版草稿頁：發布
  const submitForTemplateDraftPublish = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    const _data = S_TaskFactoryTemplete.getFormattedData(_formattedValue, currentUserId, factory?.id)
    try {
      const res = await S_TaskFactoryTemplete.update({
        modelId: modelId,
        data: {
          ..._data,
          status: 'released'
        }
      })
      await AsyncStorage.removeItem('TaskTemplateUpdate')
      await AsyncStorage.removeItem('TaskTemplateUpdateDraft')
      $_resetToTaskTemplateShow(navigation, res.id)
      setTimeout(() => {
        Alert.alert(t('發布成功'))
      }, 50)
    } catch (e) {
      console.error(e?.message, 'submitForTemplateDraftPublish')
      Alert.alert(t('發布失敗'))
    }
  }

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }}>
      <StackSetting.Screen
        name="TaskIndex"
        component={scopeFilterScreen(['task-read', 'task-read-all'], ViewTaskIndex)}
        options={({ navigation }) => ({
          title: t('任務'),
          headerShown: true,
          ...$option.headerOption,
          headerRight: () => (
            <WsIconBtn
              name="md-add"
              color={$color.white}
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={async () => {
                await AsyncStorage.removeItem('TaskCreate')
                navigation.push('RoutesTask', {
                  screen: 'TaskCreate'
                })
              }}
            />
          ),
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack();
              }}
            />
          ),
        })}
      />
      <StackSetting.Screen
        name="TaskShow"
        component={scopeFilterScreen(['task-read', 'task-read-all'], ViewTaskShow)}
        options={({ navigation, route }) => ({
          title: t('任務'),
          headerShown: true,
          animationEnabled: false,
          headerRight: () => {
            const _canEditTask = scopePermission(
              ['task-update-creator', 'task-update-taker', 'task-update'],
              currentUserScope
            )
            const _canDeleteTask = scopePermission(
              ['task-delete-creator', 'task-delete-taker', 'task-delete'],
              currentUserScope
            )
            if (!_canEditTask && !_canDeleteTask) {
              return null
            }
            if (route?.params?.hideTaskShowEdit) {
              return (
                <View
                  style={{
                    width: 32,
                    marginRight: 4
                  }}
                />
              )
            }
            return (
              <WsIconBtn
                testID={'ws-outline-edit-pencil'}
                name="ws-outline-edit-pencil"
                size={24}
                color={$color.white}
                style={{
                  marginRight: 4
                }}
                onPress={() => {
                  navigation.setParams({
                    taskHeaderActionAt: Date.now()
                  })
                }}
              />
            )
          },
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="TaskCreate"
        component={scopeFilterScreen([
          'task-create',
        ], WsStepRoutesCreate)}
        options={({ navigation }) => ({
          title: t('建立任務'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TaskCreate',
          title: t('建立任務'),
          modelName: 'task',
          fields: fields,
          currentUserId: currentUser && currentUser.id,
          stepSettings: stepSettings,
          submitFunction: submitForCreate,
          parentId: factory && factory.id,
          headerRightBtnText002: t('暫存草稿'),
          onSubmitDraft: onSubmitDraft,
        }}
      />
      <StackSetting.Screen
        name="TaskUpdate"
        component={scopeFilterScreen([
          'task-update-creator',
          'task-update-taker',
          'task-update',
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('編輯任務'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TaskUpdate',
          title: t('編輯任務'),
          modelName: 'task',
          fields: fieldsForEdit,
          stepSettings: stepSettings,
          afterFinishingTo: 'TaskShow',
          parentId: factory && factory.id,
          submitFunction: submitForEdit,
        }}
      />
      <StackSetting.Screen
        name="TaskUpdateDraft"
        component={scopeFilterScreen([
          'task-update-creator',
          'task-update-taker',
          'task-update',
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('編輯草稿'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TaskUpdateDraft',
          title: t('編輯草稿'),
          modelName: 'task',
          fields: fieldsForEditDraft,
          stepSettings: stepSettings,
          afterFinishingTo: 'TaskShow',
          parentId: factory && factory.id,
          submitFunction: submitForEdit,
          headerRightBtnText002: t('暫存草稿'),
          onSubmitDraft: onSubmitDraft,
        }}
      />
      <StackSetting.Screen
        name="TaskCreateFromAct"
        component={scopeFilterScreen('task-create', WsStepRoutesCreate)}
        options={{
          title: t('建立法規法條關聯任務'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'TaskCreate',
          title: t('建立任務'),
          modelName: 'task',
          fields: fields,
          currentUserId: currentUser && currentUser.id,
          stepSettings: stepSettings,
          submitFunction: submitForCreate,
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="TaskCreateFromMy"
        component={scopeFilterScreen('task-create', WsStepRoutesCreate)}
        options={{
          title: t('建立任務-來自我的看板'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'TaskCreate',
          title: t('建立任務'),
          modelName: 'task',
          fields: fields,
          currentUserId: currentUser && currentUser.id,
          stepSettings: stepSettings,
          submitFunction: submitForCreate,
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="TaskCreateFromAlert"
        component={scopeFilterScreen('task-create', WsStepRoutesCreate)}
        options={{
          title: t('建立任務-來自警示'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'TaskCreate',
          title: t('建立任務'),
          modelName: 'task',
          fields: fieldsCreateFromAlert,
          currentUserId: currentUser && currentUser.id,
          stepSettings: stepSettings,
          submitFunction: submitForCreate,
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="TaskCreateFromLLBroadcast"
        component={scopeFilterScreen('task-create', WsStepRoutesCreate)}
        options={{
          title: t('建立任務-來自快報'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'TaskCreate',
          title: t('建立任務'),
          modelName: 'task',
          fields: fields,
          currentUserId: currentUser && currentUser.id,
          stepSettings: stepSettings,
          submitFunction: submitForCreate,
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="DashboardTask"
        component={ViewDashboardTask}
        options={({ navigation }) => ({
          title: t('任務處理中'),
          ...$option.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false,
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
        name="DashboardTaskList"
        component={ViewDashboardTaskList}
        options={({ navigation }) => ({
          title: t('任務處理中'),
          ...$option.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false,
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
        name="TaskTemplateCreate"
        component={scopeFilterScreen([
          'task-factory-template-create',
        ], WsStepRoutesCreate)}
        options={({ navigation }) => ({
          title: t('任務公版'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TaskTemplateCreate',
          title: t('任務公版'),
          modelName: 'task-factory-template',
          fields: taskTemplateFields,
          currentUserId: currentUser && currentUser.id,
          stepSettings: stepSettings,
          submitFunction: submitForTemplateCreate,
          parentId: factory && factory.id,
          headerRightBtnText002: t('暫存草稿'),
          onSubmitDraft: onSubmitTemplateCreateDraft,
        }}
      />
      <StackSetting.Screen
        name="TaskTemplateUpdate"
        component={scopeFilterScreen([
          'task-factory-template-update',
          'task-factory-template-create',
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('編輯公版'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TaskTemplateUpdate',
          title: t('編輯公版'),
          modelName: 'task_factory_template',
          fields: taskTemplateFields,
          stepSettings: stepSettings,
          afterFinishingTo: 'TaskTemplateShow',
          parentId: factory && factory.id,
          submitFunction: submitForTemplateEdit,
          headerRightBtnText002: t('暫存草稿'),
          onSubmitDraft: onSubmitTemplateUpdateDraft,
        }}
      />
      <StackSetting.Screen
        name="TaskTemplateShow"
        component={scopeFilterScreen('task-factory-template-read', ViewTaskTemplateShow)}
        options={({ navigation, route }) => ({
          title: t('任務公版'),
          headerShown: true,
          animationEnabled: false,
          headerRight: () => {
            if (route?.params?.hideTaskShowEdit) {
              return (
                <View
                  style={{
                    width: 32,
                    marginRight: 4
                  }}
                />
              )
            }
            return (
              <WsIconBtn
                testID={'ws-outline-edit-pencil'}
                name="ws-outline-edit-pencil"
                size={24}
                color={$color.white}
                style={{
                  marginRight: 4
                }}
                onPress={() => {
                  navigation.setParams({
                    taskHeaderActionAt: Date.now()
                  })
                }}
              />
            )
          },
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'TaskIndex',
                      params: {
                        _tabIndex: 1,
                        refreshKey: Date.now()
                      }
                    }
                  ],
                  key: null
                })
              }}
            />
          ),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="TaskTemplateUpdateDraft"
        component={scopeFilterScreen([
          'task-factory-template-update',
          'task-factory-template-create',
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('公版草稿'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TaskTemplateUpdateDraft',
          title: t('公版草稿'),
          modelName: 'task_factory_template',
          fields: taskTemplateFields,
          stepSettings: stepSettings,
          afterFinishingTo: 'TaskTemplateShow',
          parentId: factory && factory.id,
          submitFunction: submitForTemplateDraftPublish,
          headerRightBtnText: t('發布'),
          headerRightBtnText002: t('暫存草稿'),
          onSubmitDraft: onSubmitTemplateUpdateDraft,
        }}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesTask
