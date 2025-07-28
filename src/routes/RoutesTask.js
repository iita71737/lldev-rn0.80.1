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
import ViewTaskShow from '@/views/Task/Show'
import { useSelector } from 'react-redux'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import $option from '@/__reactnative_stone/global/option'
import S_Task from '@/services/api/v1/task'
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
      placeholder: `${t('選擇')}`,
      rules: 'required',
      testID: 'modelsSystemClass'
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
    sub_tasks: {
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
    },
  }

  const fieldsForEdit = {
    name: {
      label: t('主旨'),
      rules: 'required'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      placeholder: t('選擇'),
      label: t('領域'),
      rules: 'required'
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
      rules: 'at_least',
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
      rules: 'required'
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
      rules: 'at_least',
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
            'apiAlert',
            'relationEvent',
            'll_broadcast',
            'article_version',
            'act_version',
            'guideline_version',
            'guideline_article_version',
            'internal_training_group',
            'related_module',
            'factory_tags'
          ]
        }
      }
    }
  ]

  // 建立任務
  const submitForCreate = async (_postData, navigation, currentUserId) => {
    console.log(JSON.stringify(_postData), '_postData');
    const _data = S_Task.getFormattedDataForCreate(_postData, currentUserId)
    console.log(JSON.stringify(_data), '_data');
    try {
      const res = await S_Task.create({
        data: _data
      })
      if (_postData.redirect_routes && res) {
        // 250327-測試後可行，reset有問題
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
        navigation.replace('RoutesAlert', {
          screen: 'AlertShow',
          params: {
            id: res.alert.id
          }
        })
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'TaskIndex',
            },
            {
              name: 'TaskShow',
              params: {
                id: res.id,
                refreshKey: Date.now()
              }
            }
          ],
          key: null
        })
        Alert.alert(t('任務已派發'))
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
      Alert.alert(t('送出成功'))
      navigation.reset({
        index: 1,
        routes: [
          {
            name: 'TaskIndex',
          },
          {
            name: 'TaskShow',
            params: {
              id: res.id,
              refreshKey: Date.now()
            }
          }
        ],
        key: null
      })
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

  // 存儲草稿
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
        Alert.alert(t('草稿已暫存，您可以至「看板頁面」的「我的任務」>「草稿」中查看或編輯。'))
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
        Alert.alert(t('草稿已暫存，您可以至「看板頁面」的「我的任務」>「草稿」中查看或編輯。'))
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

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }}>
      <StackSetting.Screen
        name="TaskIndex"
        component={scopeFilterScreen('task-read', ViewTaskIndex)}
        options={({ navigation }) => ({
          title: t('任務'),
          headerShown: false,
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
                navigation.goBack();
              }}
            />
          ),
        })}
      />
      <StackSetting.Screen
        name="TaskShow"
        component={scopeFilterScreen('task-read', ViewTaskShow)}
        options={({ navigation }) => ({
          title: t('任務'),
          headerLeft: null, // FOR INIT
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="TaskCreate"
        component={scopeFilterScreen([
          'task-update-creator',
          'task-update-taker',
          'task-update',
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
    </StackSetting.Navigator>
  )
}

export default RoutesTask
