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
import ViewEventIndex from '@/views/Event/Index'
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
// import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewDashboardEvent from '@/views/DashboardFactory/Event'
import ViewDashboardEventList from '@/views/DashboardFactory/DashboardEventListTab'
const StackSetting = createStackNavigator()

const RoutesEvent = ({ navigation }) => {
  // i18n
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const offlineMsg = useSelector(state => state.data.offlineMsg);

  // STORAGE
  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      // await AsyncStorage.setItem('offlineTempMsg', jsonValue);
    } catch (e) {
      // saving error
    }
  };

  // Fields
  const fields = {
    event_type: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'event_type',
      rules: 'required',
    },
    name: {
      label: t('主旨'),
      remind: t('建議撰寫格式'),
      placeholder: t('輸入'),
      rules: 'required',
      dialogButtonItems: [],
      dialogTitle: t('建議撰寫格式'),
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex
              flexWrap="wrap"
              style={{
                maxWidth: windowWidth * 0.7,
                marginTop: 16,
                // borderWidth:1
              }}>
              <WsDes size={14}>{t('建議於主旨詳細填寫事件內容')}</WsDes>
            </WsFlex>
            <View
              style={{
                // borderWidth: 1,
              }}>
              <WsFlex flexWrap={'wrap'} alignItems={'flex-start'}>
                <WsText size={14} letterSpacing={1} style={{}}>
                  <WsIcon
                    name="ws-outline-edit-pencil"
                    color={$color.gray3d}
                    size={24}
                    style={{
                      marginRight: 6
                    }}
                  />
                  {t('以「操作異常」為例：A廠8號排放口排放氨氮值超標：9.0（標準6.0）')}
                </WsText>
              </WsFlex>
              <WsFlex flexWrap={'nowrap'} alignItems={'flex-start'} style={{ marginTop: 16 }}>
                <WsText size={14} letterSpacing={1} style={{ marginRight: 16 }}>
                  <WsIcon
                    name="ws-outline-edit-pencil"
                    color={$color.gray3d}
                    size={24}
                    style={{
                      marginRight: 6
                    }}
                  />
                  {t('以「接獲罰單」為例：接獲高雄市環保局排放污水罰單：限期改善＋罰鍰30萬')}
                </WsText>
              </WsFlex>
            </View>
          </>
        )
      },
    },
    owner: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      rules: 'required',
      testID: 'modelsSystemClass'
    },
    occur_at: {
      label: t('發生時間'),
      type: 'datetime',
      placeholder: `${t('月.日')}  ${t('時:分')}`,
      rules: 'required',
      testID: '發生日期/時間'
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
      },
    },
    remark: {
      label: t('說明'),
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
            'remark',
            'occur_at',
            'system_subclasses',
            'attaches',
            'file_attaches'
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
  const submitEventCreate = async (data, navigation) => {
    const _data = await S_Event.getFormattedData(data, currentUser)
    console.log(_data, '_data--');
    try {
      const res = await S_Event.create({
        data: _data
      }).then(res => {
        // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1886
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'EventIndex',
            },
            {
              name: 'EventShow',
              params: {
                id: res.id
              }
            }
          ],
          key: null
        })
      })
    } catch (e) {
      console.error(e);
      navigation.navigate('EventIndex')
    }
  }

  // 編輯事件
  const submitEventEdit = async (data, modelId, versionId, navigation) => {
    const _data = await S_Event.getFormattedData(data, currentUser)
    try {
      await S_Event.update({
        data: _data,
        modelId: modelId
      })
        .then(() => {
          Alert.alert('事件編輯成功')
        })
    } catch (e) {
      console.error(e);
      const _offlineTempMsg = {
        service: `event`,
        method: `update`,
        modelId: modelId,
        data: _data
      };
      offlineMsg.push(_offlineTempMsg);
      storeData(offlineMsg);
      store.dispatch(setOfflineMsg(offlineMsg));
    } finally {
      navigation.navigate({
        name: 'EventShow',
        params: {
          id: modelId
        }
      })
    }
  }

  return (
    <>
      <StackSetting.Navigator
        screenOptions={{
          headerBackTitleVisible: false
        }}>
        <StackSetting.Screen
          name="EventIndex"
          component={scopeFilterScreen('event-read', ViewEventIndex)}
          options={({ navigation }) => ({
            title: t('事件管理'),
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
                  navigation.goBack()
                }}
              />
            ),
          })}
          initialParams={{
          }}
        />
        <StackSetting.Screen
          name="EventShow"
          component={scopeFilterScreen('event-read', ViewEventShow)}
          options={({ navigation }) => ({
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
          name="EventUpdate"
          component={scopeFilterScreen([
            'event-update-creator',
            'event-update-owner',
            'event-update',
          ], WsStepRoutesUpdate)}
          options={({ navigation }) => ({
            title: t('編輯事件'),
            ...$option.headerOption,
            headerShown: false
          })}
          initialParams={{
            name: 'EventUpdate',
            title: t('編輯事件'),
            modelName: 'event',
            fields: fieldsForEdit,
            stepSettings: stepSettings,
            afterFinishingTo: 'EventShow',
            parentId: factory && factory.id ? factory.id : null,
            submitFunction: submitEventEdit
          }}
        />
        <StackSetting.Screen
          name="EventCreate"
          component={scopeFilterScreen('event-create', WsStepRoutesCreate)}
          options={{
            title: t('新增事件'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'EventCreate',
            title: t('新增事件'),
            modelName: 'event',
            fields: fields,
            stepSettings: stepSettings,
            afterFinishingTo: 'EventIndex',
            parentId: factory && factory.id ? factory.id : null,
            submitFunction: submitEventCreate
          }}
        />
        <StackSetting.Screen
          name="EventPickTypeTemplate"
          component={scopeFilterScreen(
            'event-create',
            ViewEventPickTypeTemplate
          )}
          options={({ navigation }) => ({
            title: t('新增事件'),
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
          name="DashboardEvent"
          component={scopeFilterScreen('event-read', ViewDashboardEvent)}
          options={({ navigation }) => ({
            title: t('風險事件處理中'),
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
          name="DashboardEventList"
          component={scopeFilterScreen('event-read', ViewDashboardEventList)}
          options={({ navigation }) => ({
            title: t('風險事件處理中'),
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
    </>
  )
}

export default RoutesEvent
