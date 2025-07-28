import React from 'react'
import { View, Dimensions, Alert } from 'react-native'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  LlApiFail,
  WsText,
  WsDes,
  WsIcon,
  WsFlex,
  WsTag,
  WsIconBtn
} from '@/components'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import ViewContractorEnter from '@/views/ContractorEnter/Index'
import ViewContractorEnterShow from '@/views/ContractorEnter/Show'
import ViewExitChecklistShow from '@/views/ContractorEnter/ExitChecklist/Show'
import ViewExitChecklistIntroduction from '@/views/ContractorEnter/ExitChecklist/Create/Introduction'
import ViewExitChecklistProcedure from '@/views/ContractorEnter/ExitChecklist/Create/Procedure'
import $option from '@/__reactnative_stone/global/option'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'
import ViewContractorEnterRecord from '@/views/ContractorEnter/ContractorEnterRecord/Index'
const StackSetting = createStackNavigator()
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import ViewDashboardContractorEnter from '@/views/DashboardFactory/ContractorEnter'

const RoutesContractorEnter = () => {
  const { t, i18n } = useTranslation()

  // REDUX
  const factory = useSelector(state => state.data.currentFactory)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentContractor = useSelector(state => state.data.contractor)

  // 新增進場欄位
  const fieldsForCreate = {
    contractor: {
      type: 'belongsto',
      label: t('承攬商'),
      nameKey: 'name',
      params: {
        contractor_status: 1
      },
      modelName: 'contractor',
      rules: 'required',
      renderCom: (item) => {
        return (
          <WsTag
            textColor={
              item.contractor_status == 1 ? $color.green : $color.danger
            }
            backgroundColor={
              item.contractor_status == 1 ? $color.green12l : $color.danger11l
            }
            style={{
              marginLeft: 24,
              width: item.contractor_status == 1 ? 59 : 74
            }}>
            {item.contractor_status == 1 ? t('合作中') : t('合作終止')}
          </WsTag>
        )
      }
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: t('選擇'),
      rules: 'required'
    },
    enter_period_type: {
      type: 'radio',
      items: [
        { label: t('單日進場'), value: 1 },
        { label: t('連續進場'), value: 2 }
      ],
      rules: 'required'
    },
    enter_start_date: {
      type: 'date',
      label: t('預計進場起日'),
      rules: 'required'
    },
    enter_end_date: {
      type: 'date',
      label: t('預計進場迄日'),
      displayCheck(fieldsValue) {
        if (fieldsValue.enter_period_type == 2) {
          return true
        } else {
          return false
        }
      }
    },
    enter_start_time: {
      type: 'time',
      label: t('預計進場開始時間'),
      rules: 'required'
    },
    enter_end_time: {
      type: 'time',
      label: t('預計進場結束時間'),
      rules: 'required'
    },
    operate_location: {
      label: t('作業地點'),
      rules: 'required'
    },
    task_content: {
      label: t('作業內容'),
      multiline: true,
      rules: 'required',
      contentHeight: 268,
      remind: t('建議撰寫格式'),
      dialogButtonItems: [],
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex flexDirection="column" alignItems="center">
              <WsText letterSpacing={1} style={{ marginBottom: 8 }}>
                {t('建議撰寫格式')}
              </WsText>
              <WsFlex
                style={{ margin: 16 }}
                flexWrap="wrap"
                flexDirection="column"
                alignItems="flex-start">
                <WsDes style={{ padding: 16 }} size={14}>
                  {t('建議於作業內容詳細填寫進場廠商、作業內容、作業時間')}
                </WsDes>
                <WsFlex
                  style={{ paddingRight: 16 }}
                  alignItems="flex-start"
                  flexWrap={'nowrap'}>
                  <WsIcon
                    name="ws-outline-edit-pencil"
                    color={$color.gray3d}
                    size={24}
                  />
                  <WsText size={14} letterSpacing={1}>
                    {t(
                      '外部廠商進場：維修C棟排煙系統，C棟排煙系統凌晨1：00-17：00關閉'
                    )}
                  </WsText>
                </WsFlex>
              </WsFlex>
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
    notify_at: {
      type: 'date',
      label: t('提醒設定日期')
    },
    exit_check_item: {
      label: t('復歸事項'),
      multiline: true,
      placeholder: t('輸入復歸事項'),
      rules: 'required',
      contentHeight: 400,
      remind: t('建議撰寫格式'),
      dialogButtonItems: [],
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex flexDirection="column" alignItems="center">
              <WsText letterSpacing={1} style={{ marginBottom: 8 }}>
                {t('建議撰寫格式')}
              </WsText>
              <WsFlex
                style={{ margin: 16 }}
                flexWrap="wrap"
                flexDirection="column"
                alignItems="flex-start">
                <WsDes style={{ padding: 16 }} size={14}>
                  {t(
                    '應就本次進場作業所移動、關閉，或暫停功能之機器、設備（包含閥門），於承攬商離場前逐一確認、清點是否均已復歸（回復原狀），使該等設備或機器可恢復正常運作。'
                  )}
                </WsDes>
                <WsFlex
                  style={{ paddingRight: 16 }}
                  alignItems="flex-start"
                  flexWrap={'nowrap'}>
                  <WsIcon
                    name="ws-outline-edit-pencil"
                    color={$color.gray3d}
                    size={24}
                  />
                  <WsText size={14} letterSpacing={1}>
                    {t('經確認及清點完成復歸之機器或設備，應確實紀錄。')}
                  </WsText>
                </WsFlex>
              </WsFlex>
            </WsFlex>
          </>
        )
      }
    },
    remark: {
      label: t('備註'),
      placeholder: t('輸入備註'),
      multiline: true
    },
    attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor/attach` : null
    }
  }

  // 編輯進場欄位
  const fieldsForEdit = {
    contractor: {
      type: 'belongsto',
      label: t('承攬商'),
      nameKey: 'name',
      modelName: 'contractor',
      rules: 'required',
      renderCom: (item) => {
        return (
          <WsTag
            textColor={
              item.contractor_status == 1 ? $color.green : $color.danger
            }
            backgroundColor={
              item.contractor_status == 1 ? $color.green12l : $color.danger11l
            }
            style={{
              marginLeft: 24,
              width: item.contractor_status == 1 ? 59 : 74
            }}>
            {item.contractor_status == 1 ? t('合作中') : t('合作終止')}
          </WsTag>
        )
      }
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: t('選擇'),
      rules: 'required'
    },
    enter_period_type: {
      label: t('證照名稱'),
      type: 'radio',
      items: [
        { label: t('單日進場'), value: 1 },
        { label: t('連續進場'), value: 2 }
      ],
      rules: 'required'
    },
    enter_start_date: {
      type: 'date',
      label: t('預計進場起日'),
      rules: 'required'
    },
    enter_end_date: {
      type: 'date',
      label: t('預計進場迄日'),
      displayCheck(fieldsValue) {
        if (fieldsValue.enter_period_type == 2) {
          return true
        } else {
          return false
        }
      }
    },
    enter_start_time: {
      type: 'time',
      label: t('預計進場開始時間'),
      rules: 'required'
    },
    enter_end_time: {
      type: 'time',
      label: t('預計進場結束時間'),
      rules: 'required'
    },
    operate_location: {
      label: t('作業地點'),
      rules: 'required'
    },
    task_content: {
      label: t('作業內容'),
      multiline: true,
      rules: 'required',
      remind: t('建議撰寫格式'),
      dialogButtonItems: [],
      contentHeight: 268,
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex flexDirection="column" alignItems="center">
              <WsText letterSpacing={1} style={{ marginBottom: 4 }}>
                {t('建議撰寫格式')}
              </WsText>
              <WsFlex
                style={{}}
                flexWrap="wrap"
                flexDirection="column"
                alignItems="flex-start">
                <WsDes style={{}} size={14}>
                  {t('建議於作業內容詳細填寫進場廠商、作業內容、作業時間')}
                </WsDes>
                <WsFlex
                  style={{ paddingRight: 16 }}
                  alignItems="flex-start"
                  flexWrap={'nowrap'}>
                  <WsIcon
                    name="ws-outline-edit-pencil"
                    color={$color.gray3d}
                    size={24}
                  />
                  <WsText size={14} letterSpacing={1}>
                    {t(
                      '外部廠商進場：維修C棟排煙系統，C棟排煙系統凌晨1：00-17：00關閉'
                    )}
                  </WsText>
                </WsFlex>
              </WsFlex>
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
    notify_at: {
      type: 'date',
      label: t('提醒日期')
    },
    exit_check_item: {
      label: t('復歸事項'),
      multiline: true,
      placeholder: `${t('輸入')}`,
      rules: 'required',
      contentHeight: 400,
      remind: t('建議撰寫格式'),
      dialogButtonItems: [],
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex flexDirection="column" alignItems="center">
              <WsText letterSpacing={1} style={{ marginBottom: 8 }}>
                {t('建議撰寫格式')}
              </WsText>
              <WsFlex
                style={{ margin: 16 }}
                flexWrap="wrap"
                flexDirection="column"
                alignItems="flex-start">
                <WsDes style={{ padding: 16 }} size={14}>
                  {t('應就本次進場作業所移動、關閉，或暫停功能之機器、設備（包含閥門），於承攬商離場前逐一確認、清點是否均已復歸（回復原狀），使該等設備或機器可恢復正常運作。')}
                </WsDes>
                <WsFlex
                  style={{ paddingRight: 16 }}
                  alignItems="flex-start"
                  flexWrap={'nowrap'}>
                  <WsIcon
                    name="ws-outline-edit-pencil"
                    color={$color.gray3d}
                    size={24}
                  />
                  <WsText size={14} letterSpacing={1}>
                    {t('經確認及清點完成復歸之機器或設備，應確實記錄。')}
                  </WsText>
                </WsFlex>
              </WsFlex>
            </WsFlex>
          </>
        )
      }
    },
    remark: {
      label: t('備註'),
      placeholder: `${t('輸入')}${t('備註')}`,
      multiline: true
    },
    attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor/attach` : null
    }
  }

  const stepSettings = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.license_type &&
          fieldsValue.license_type.show_fields
        ) {
          return ['name', ...fieldsValue.license_type.show_fields]
        } else {
          return [
            'contractor',
            'system_subclasses',
            'enter_period_type',
            'enter_start_date',
            'enter_end_date',
            'enter_start_time',
            'enter_end_time',
            'operate_location',
            'task_content',
            'owner',
            'notify_at',
            'exit_check_item_updated_at',
            'exit_check_item_updated_user',
            'exit_check_item',
            'remark',
            'attaches'
          ]
        }
      }
    }
  ]

  // 新增進場紀錄
  const submitFunctionForCreate = async (
    _postData,
    navigation,
    currentUserId
  ) => {
    const _data = {
      ..._postData,
      enter_start_time: moment(_postData.enter_start_time).utc().format('HH:mm:ss'),
      enter_end_time: moment(_postData.enter_end_time).utc().format('HH:mm:ss'),
      enter_end_date: _postData.enter_end_date ? _postData.enter_end_date : _postData.enter_start_date,
      creator: currentUserId
    }
    try {
      const res = await S_ContractorEnterRecord.create({
        data: _data
      })
      const createData = S_ExitChecklist.formattedExitChecklistInit(res)
      Alert.alert('新增進場紀錄成功')
      navigation.navigate('ContractorEnter')
    } catch (e) {
      console.error(e.message, '===error===')
      Alert.alert('新增進場紀錄失敗')
      navigation.navigate('ContractorEnter')
    }


  }

  // 編輯進場紀錄
  const submitFunctionForEdit = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    const _editData = S_ContractorEnterRecord.getFormattedDataForEdit(
      _formattedValue,
      currentUserId
    )
    const res = await S_ContractorEnterRecord.updateEnterRecord({
      modelId,
      data: _editData
    })
    navigation.navigate({
      name: 'ContractorEnterShow',
      params: {
        id: modelId
      }
    })
  }

  return (
    <>
      <StackSetting.Navigator
        screenOptions={{
          headerBackTitleVisible: false
        }}>
        <StackSetting.Screen
          name="ContractorEnter"
          component={scopeFilterScreen('contractor-enter-record-read', ViewContractorEnter)}
          options={({ navigation }) => ({
            title: t('進場管理'),
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
          initialParams={{
            defaultFilter: {
              date_range: { range: 'nolimit' },
              factory: factory && factory.id ? factory.id : null,
              contractor: currentContractor ? currentContractor.map(_ => _.id) : [],
              system_subclasses:
                S_SystemClass.getAllSubSystemClassesId(systemClasses)
            }
          }}
        />

        <StackSetting.Screen
          name="ContractorEnterShow"
          component={scopeFilterScreen(
            'contractor-enter-record-read',
            ViewContractorEnterShow
          )}
          options={({ navigation }) => ({
            title: t('進場記錄'),
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
          name="ContractorEnterCreate"
          component={scopeFilterScreen(
            'contractor-enter-record-create',
            WsStepRoutesCreate
          )}
          options={{
            title: t('新增進場紀錄'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorEnterCreate',
            title: t('新增進場紀錄'),
            modelName: 'contractor_enter_record',
            fields: fieldsForCreate,
            stepSettings: stepSettings,
            afterFinishingTo: 'ContractorEnter',
            parentId: factory && factory.id,
            currentUserId: currentUser && currentUser.id ? currentUser.id : null,
            submitFunction: submitFunctionForCreate
          }}
        />

        <StackSetting.Screen
          name="ContractorEnterUpdate"
          component={scopeFilterScreen(
            [
              'contractor-enter-record-update-creator',
              'contractor-enter-record-update-owner',
              'contractor-enter-record-update'
            ],
            WsStepRoutesUpdate
          )}
          options={({ navigation }) => ({
            title: t('編輯'),
            ...$option.headerOption,
            headerShown: false
          })}
          initialParams={{
            name: 'ContractorEnterUpdate',
            title: t('編輯'),
            modelName: 'contractor_enter_record',
            fields: fieldsForEdit,
            stepSettings: stepSettings,
            afterFinishingTo: 'ContractorEnterShow',
            currentUserId: currentUser && currentUser.id ? currentUser.id : null,
            submitFunction: submitFunctionForEdit
          }}
        />
        <StackSetting.Screen
          name="ExitChecklistShow"
          component={scopeFilterScreen(
            'contractor-enter-record-read',
            ViewExitChecklistShow
          )}
          options={({ navigation }) => ({
            title: t('收工檢查結果'),
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
          name="ExitChecklistIntroduction"
          component={scopeFilterScreen(
            'exit-checklist',
            ViewExitChecklistIntroduction
          )}
          options={({ navigation }) => ({
            title: t('收工檢查'),
            ...$option.headerOption
          })}
        />

        <StackSetting.Screen
          name="ExitChecklistProcedure"
          component={scopeFilterScreen(
            'exit-checklist',
            ViewExitChecklistProcedure
          )}
          options={({ navigation }) => ({
            title: t('收工檢查表'),
            headerShown: false,
            ...$option.headerOption
          })}
        />

        <StackSetting.Screen
          name="ContractorEnterRecord"
          component={scopeFilterScreen('contractor-enter-record-read', ViewContractorEnterRecord)}
          options={({ navigation, route }) => ({
            title: t('進場記錄'),
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
          name="DashboardContractorEnter"
          component={scopeFilterScreen('contractor-enter-record-read', ViewDashboardContractorEnter)}
          options={{
            title: t('今日進場'),
            ...$option.headerOption,
            headerTitleAlign: 'center',
            animationEnabled: false
          }}
        />
      </StackSetting.Navigator>
    </>
  )
}

export default RoutesContractorEnter
