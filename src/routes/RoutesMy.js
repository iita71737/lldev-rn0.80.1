import React from 'react'
import {
  View,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
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
  WsBtn,
  WsHeaderBackBtn,
  WsSubtaskCard
} from '@/components'
import moment from 'moment'
import $option from '@/__reactnative_stone/global/option'
import $color from '@/__reactnative_stone/global/color'
import ViewMy from '@/views/My'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import ViewEventPickTypeTemplate from '@/views/Event/Create/PickTypeTemplate'
import { useSelector, connect } from 'react-redux'
import S_Init from '@/__reactnative_stone/services/app/Init'
import S_Event from '@/services/api/v1/event'
import S_Task from '@/services/api/v1/task'
import AsyncStorage from '@react-native-community/async-storage'

const StackSetting = createStackNavigator()
const RoutesMy = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // Fields
  const [fieldsEvent, setFieldEvent] = React.useState({
    event_type: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'event_type',
      rules: 'required'
    },
    name: {
      label: t('主旨'),
      remind: t('建議撰寫格式'),
      placeholder: t('輸入'),
      rules: 'required',
      contentHeight: 268,
      dialogButtonItems: [],
      dialogTitle: t('建議撰寫格式'),
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex
              flexWrap="wrap"
              style={{
                paddingHorizontal: 16,
                width: windowWidth * 0.8,
                marginTop: 16
              }}>
              <WsDes size={14}>{t('建議於主旨詳細填寫事件內容')}</WsDes>
            </WsFlex>
            <View
              style={{
                padding: 16
              }}>
              <WsFlex flexWrap={'nowrap'} alignItems={'flex-start'}>
                <WsIcon
                  name="ws-outline-edit-pencil"
                  color={$color.gray3d}
                  size={24}
                  style={{
                    marginRight: 6
                  }}
                />
                <WsText size={14} letterSpacing={1} style={{ marginRight: 16 }}>
                  {t(
                    '以「操作異常」為例：A廠8號排放口排放氨氮值超標：9.0（標準6.0）'
                  )}
                </WsText>
              </WsFlex>
              <WsFlex flexWrap={'nowrap'} alignItems={'flex-start'} style={{ marginTop: 16 }}>
                <WsIcon
                  name="ws-outline-edit-pencil"
                  color={$color.gray3d}
                  size={24}
                  style={{
                    marginRight: 6
                  }}
                />
                <WsText size={14} letterSpacing={1} style={{ marginRight: 16 }}>
                  {t(
                    '以「接獲罰單」為例：接獲高雄市環保局排放污水罰單：限期改善＋罰鍰30萬'
                  )}
                </WsText>
              </WsFlex>
            </View>
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
      rules: 'required',
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
  })
  const stepSettingsEvent = [
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

  return (
    <StackSetting.Navigator
      initialRouteName="My"
      screenOptions={{
        headerBackTitleVisible: false
      }}
    >
      <StackSetting.Screen
        name="My"
        component={ViewMy}
        options={{
          title: t('看板'),
          ...gOption.headerOption,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesMy
