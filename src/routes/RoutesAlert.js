import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { View, Dimensions, TouchableOpacity, Alert } from 'react-native'
import {
  WsHeaderBackBtn,
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsSubtaskCard,
  WsText,
  WsFlex,
  LlAlertCard001,
  LlApiFail,
  WsLoading,
  WsIconBtn,
  WsBtn,
  WsDes,
  WsIcon,
  WsStepRoutesCreate001,
  WsStepRoutesUpdate001
} from '@/components'
import ViewAlertIndex from '@/views/Alert/Index'
import ViewAlertShow from '@/views/Alert/Show'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_Init from '@/__reactnative_stone/services/app/Init'
import $option from '@/__reactnative_stone/global/option'
import AsyncStorage from '@react-native-community/async-storage'
import S_Task from '@/services/api/v1/task'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import ViewDashboardAlert from '@/views/DashboardFactory/Alert'
import ViewDashboardAlertList from '@/views/DashboardFactory/DashboardAlertListTab'
const StackSetting = createStackNavigator()

const RoutesAlert = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // PROPS
  const {
    defaultTabIndex
  } = route?.params || ''

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // STATE
  const [initFirebaseMessage, setInitFirebaseMessage] = React.useState(false);

  // Fields For Edit Event
  const stepSettingsForEditEvent = [
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
            'attaches'
          ]
        }
      }
    }
  ]
  const fieldsForEditEvent = {
    event_status: {
      type: 'radio',
      label: t('狀態'),
      items: [
        { label: t('處理中'), value: 1 },
        { label: t('列管中'), value: 2 },
        { label: t('處理完畢'), value: 3 }
      ],
      autoFocus: true,
      rules: 'required'
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
    remark: {
      label: t('說明'),
      multiline: true,
      placeholder: t('輸入'),
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
        if (fieldsValue.event_type && fieldsValue.event_type.id === 3) {
          return true
        } else {
          return false
        }
      },
      getMinimumDate(fieldValue) {
        return fieldValue.occur_at
      }
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      rules: 'required'
    },
    attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/event/attach` : null
    }
  }
  // 編輯事件
  const submitEventEdit = async (data, modelId, versionId, navigation) => {
    const occurDate = moment(data.occur_at).format('YYYY-MM-DD HH:mm')
    const eventData = {
      creator: currentUser && currentUser.id ? currentUser.id : null,
      owner: data.owner,
      event_type: data.event_type,
      event_status: data.event_status ? data.event_status : null,
      name: data.name,
      occur_at: moment(occurDate),
      remark: data.remark,
      attaches: data.attaches,
      system_classes: data.system_classes,
      system_subclasses: data.system_subclasses,
      improvement_limited_period: data.improvement_limited_period
        ? data.improvement_limited_period
        : null
    }
    await S_Event.update({
      data: eventData,
      modelId: modelId
    })
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'AlertIndex'
            },
            {
              name: 'EventShow',
              params: {
                id: modelId
              }
            }
          ],
          key: null
        })
      })
      .catch(() => {
        console.error(e, 'e')
        navigation.navigate('AlertIndex')
      })
  }


  return (
    <>
      <StackSetting.Navigator
        screenOptions={{
          headerBackTitleVisible: false
        }}
        initialRouteName="AlertIndex"
      >
        <StackSetting.Screen
          name="AlertIndex"
          component={ViewAlertIndex}
          initialParams={{
            defaultTabIndex: defaultTabIndex,
          }}
          options={{
            title: t('警示'),
            // headerShown: false,
            ...gOption.headerOption,
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
          }}
        />
        <StackSetting.Screen
          name="AlertShow"
          component={ViewAlertShow}
          options={{
            title: t('警示'),
            ...gOption.headerOption,
            gestureEnabled: false
          }}
        />
        <StackSetting.Screen
          name="DashboardAlertList"
          component={ViewDashboardAlertList}
          options={({ navigation }) => ({
            title: t('警示未排除'),
            ...gOption.headerOption,
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
          name="DashboardAlert"
          component={ViewDashboardAlert}
          options={{
            title: t('警示未排除'),
            ...gOption.headerOption,
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
          }}
        />
      </StackSetting.Navigator>
    </>
  )
}

export default RoutesAlert
