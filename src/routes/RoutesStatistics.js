import React from 'react'
import { Alert, View, Dimensions, TouchableOpacity, Button } from 'react-native'
import { useSelector } from 'react-redux'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsText,
  WsDes,
  WsIcon,
  WsFlex,
  LlApiFail,
  WsLoading,
  WsIconBtn
} from '@/components'
import StatisticsIndex from '@/views/Statistics/Index'
import ViewEventShow from '@/views/Event/Show'
import $color from '@/__reactnative_stone/global/color'
import ViewEventPickTypeTemplate from '@/views/Event/Create/PickTypeTemplate'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import $option from '@/__reactnative_stone/global/option'
import S_User from '@/services/api/v1/user'
import S_Event from '@/services/api/v1/event'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import store from '@/store'
import {
  setOfflineMsg
} from '@/store/data'
import ViewDashboardEvent from '@/views/DashboardFactory/Event'
import ViewDashboardEventList from '@/views/DashboardFactory/DashboardEventListTab'
const StackSetting = createStackNavigator()
import StatisticsShow from '@/views/Statistics/Show'
import StatisticsRecordCreate from '@/views/Statistics/Create/StatisticsRecordCreate'
import AsyncStorage from '@react-native-community/async-storage'
import { nanoid } from 'nanoid/non-secure';

const RoutesStatistics = ({ navigation }) => {
  // i18n
  const { t, i18n } = useTranslation()

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // Fields
  const fields = {
    name: {
      label: t('名稱'),
      placeholder: t('輸入'),
      rules: 'required',
    },
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
    },
    date_picker_type: {
      label: t('時間區間'),
      type: 'radio',
      items: [
        { label: t('固定'), value: 2 },
        { label: t('最近'), value: 1 },
      ],
      rules: 'required',
      updateValueOnCheckboxChange: ($event, value, fields) => {
        if ($event === 1) {
          delete fields.start_time.rules
          delete fields.end_time.rules
          fields.dynamic_data_time.rules = 'required'
        } else if ($event === 2) {
          delete fields.dynamic_data_time.rules
          fields.start_time.rules = 'required'
          fields.end_time.rules = 'required'
        }
      },
    },
    dynamic_data_time: {
      label: t('最近'),
      type: 'radio_group',
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.date_picker_type == 1) {
          return true
        } else {
          return false
        }
      }
    },
    start_time: {
      label: t('開始日期'),
      type: 'date',
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.date_picker_type == 2) {
          return true
        } else {
          return false
        }
      }
    },
    end_time: {
      label: t('結束日期'),
      type: 'date',
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.date_picker_type == 2) {
          return true
        } else {
          return false
        }
      }
    },
    time_unit: {
      label: t('時間單位'),
      type: 'picker',
      rules: 'required',
      items: [
        { label: t('日'), value: 'day' },
        { label: t('週'), value: 'week' },
        { label: t('月'), value: 'month' },
        { label: t('季'), value: 'season' },
        { label: t('年'), value: 'year' }
      ],
    },
    users: {
      type: 'belongstomany',
      label: `${t('限閱人員')}`,
      nameKey: 'name',
      valueKey: 'id',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    user_factory_role_templates: {
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
    remark: {
      label: t('備註'),
      multiline: true,
      placeholder: t('輸入'),
      rules: 'required',
      testID: '事件說明'
    },
    file_attaches: {
      modelName: 'event',
      type: 'Ll_filesAndImages',
      label: t('附件'),
    }
  }

  const stepSettings = [
    {
      getShowFields(value) {
        if (value && value.event_type && value.event_type.show_fields) {
          return [
            'event_status',
            'event_type',
            'name',
            'owner',
            'remark',
            'occur_at',
            'system_subclasses',
            'attaches',
            'file_attaches',
            ...value.event_type.show_fields
          ]
        } else {
          return [
            'event_status',
            'event_type',
            'name',
            'owner',
            'users',
            'user_factory_role_templates',
            'factory_tags',
            'remark',
            'date_picker_type',
            'dynamic_data_time',
            'time_unit',
            'start_time',
            'end_time',
            'system_subclasses',
            'attaches',
            'file_attaches',
          ]
        }
      }
    }
  ]

  // Fields For Edit
  const fieldsForEdit = {
    event_status: {
      type: 'radio',
      label: t('狀態'),
      items: [
        { label: t('處理中'), value: 1 },
        { label: t('列管中'), value: 2 },
        {
          label: t('處理完畢'),
          value: 3,
          showRemind: {
            remind: t('注意，狀態改為處理完畢，將不能再次編輯或刪除此事件'),
            remindColor: $color.danger,
            remindBtnDisabled: true
          }
        }
      ],
      autoFocus: true,
      rules: 'required',
    },
    event_type: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'event_type',
      rules: 'required',
      editable: false
    },
    name: {
      label: t('主旨'),
      remind: t('建議撰寫格式'),
      placeholder: t('輸入'),
      contentHeight: 268,
      rules: 'required',
      dialogButtonItems: [],
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex flexDirection="column">
              <WsText letterSpacing={1} style={{ marginBottom: 8 }}>
                {t('建議撰寫格式')}
              </WsText>
            </WsFlex>
            <WsFlex
              flexWrap="wrap"
              flexDirection="column"
              alignItems="flex-start"
              style={{
                width: windowWidth * 0.7,
                marginTop: 16
              }}>
              <WsDes size={14}>{t('建議於主旨詳細填寫事件內容')}</WsDes>
            </WsFlex>
            <WsFlex
              alignItems="flex-start"
              flexWrap={'wrap'}>
              <WsIcon
                name="ws-outline-edit-pencil"
                color={$color.gray3d}
                size={24}
              />
              <WsText size={14} letterSpacing={1}>
                {t(
                  '以「操作異常」為例：A廠8號排放口排放氨氮值超標：9.0（標準6.0）'
                )}
              </WsText>
            </WsFlex>
            <WsFlex
              style={{ padding: 8 }}
              alignItems="flex-start"
              flexWrap={'wrap'}>
              <WsIcon
                name="ws-outline-edit-pencil"
                color={$color.gray3d}
                size={24}
              />
              <WsText size={14} letterSpacing={1}>
                {t(
                  '以「接獲罰單」為例：接獲高雄市環保局排放污水罰單：限期改善＋罰鍰30萬'
                )}
              </WsText>
            </WsFlex>
          </>
        )
      }
    },
    owner: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      rules: 'required'
    },
    occur_at: {
      label: t('發生時間'),
      type: 'datetime',
      placeholder: `${t('月.日')}  ${t('時:分')}`,
      rules: 'required'
    },
    improvement_limited_period: {
      label: t('改善期限'),
      type: 'date',
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.event_type && fieldsValue.event_type.show_fields && fieldsValue.event_type.show_fields.includes('improvement_limited_period')) {
          return true
        } else {
          return false
        }
      },
      getMinimumDate(fieldValue) {
        return fieldValue.occur_at
      }
    },
    remark: {
      label: t('說明'),
      multiline: true,
      placeholder: t('輸入'),
      rules: 'required'
    },
    file_attaches: {
      modelName: 'event',
      type: 'Ll_filesAndImages',
      label: t('附件'),
    }
  }

  // 新增事件
  const submitStatisticsCreate = async (data, navigation) => {
    const _id = nanoid()
    try {
      const withId = {
        ...data,
        id: _id, // ✅ 自動產生 UUID
        created_at: new Date().toISOString(), // （可選）附上建立時間
      };
      console.log(withId, '📦 儲存資料物件');
      // 2️⃣ 將物件轉成 JSON
      const jsonValue = JSON.stringify(withId);
      // 3️⃣ 寫入本地儲存
      await AsyncStorage.setItem(`@statistics_data`, jsonValue);
      console.log(jsonValue, '✅ 資料已成功儲存');
      // 4️⃣ 導向其他頁面
      navigation.navigate('StatisticsIndex', { data: withId });
    } catch (e) {
      console.error('❌ 儲存失敗:', e);
    }
  }

  // 編輯事件
  const submitStatisticsEdit = async (data, modelId, versionId, navigation) => {
    console.log(data, 'submitStatisticsEdit');
  }

  return (
    <>
      <StackSetting.Navigator
        screenOptions={{
          headerBackTitleVisible: false
        }}>
        <StackSetting.Screen
          name="StatisticsIndex"
          component={scopeFilterScreen('event-read', StatisticsIndex)}
          options={({ navigation }) => ({
            title: t('數量統計管理'),
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
          initialParams={{
          }}
        />
        <StackSetting.Screen
          name="StatisticsCreate"
          component={scopeFilterScreen('event-create', WsStepRoutesCreate)}
          options={{
            title: t('新增數量統計'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'StatisticsCreate',
            title: t('新增數量統計'),
            modelName: 'event',
            fields: fields,
            stepSettings: stepSettings,
            afterFinishingTo: 'StatisticsIndex',
            submitFunction: submitStatisticsCreate
          }}
        />
        <StackSetting.Screen
          name="StatisticsEdit"
          component={scopeFilterScreen('event-create', WsStepRoutesUpdate)}
          options={{
            title: t('編輯數量統計'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'StatisticsEdit',
            title: t('編輯數量統計'),
            modelName: 'event',
            fields: fields,
            stepSettings: stepSettings,
            afterFinishingTo: 'StatisticsIndex',
            submitFunction: submitStatisticsEdit
          }}
        />
        <StackSetting.Screen
          name="StatisticsShow"
          component={scopeFilterScreen('event-read', StatisticsShow)}
          options={({ navigation }) => ({
            title: t('數量統計內頁'),
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
          name="StatisticsRecordCreate"
          component={scopeFilterScreen('event-read', StatisticsRecordCreate)}
          options={({ navigation }) => ({
            title: t('選表選題頁'),
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
      </StackSetting.Navigator>
    </>
  )
}

export default RoutesStatistics
