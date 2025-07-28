import React from 'react'
import { View, Dimensions } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsText,
  WsDes,
  WsIcon,
  WsFlex,
  WsIconBtn
} from '@/components'
import ViewChangeIndex from '@/views/Change/Index'
import ViewChangeShow from '@/views/Change/Show'
import ViewChangeItemTemplateRemark from '@/views/Change/Create/ChangeItemTemplateRemark'
import ChangeCreateStep from '@/views/Change/Create/Step'
import CreateAssignChange from '@/views/Change/Create/AssignChange'
import UpdateAssignChange from '@/views/Change/Update/AssignChange'
import ChangeUpdateStep from '@/views/Change/Update/Step'
import ViewChangeAssignmentIndex from '@/views/Change/ChangeAssignment/Index'
import ViewChangeAssignmentIntroduction from '@/views/Change/ChangeAssignment/Update/Introduction'
import ViewChangeAssignmentProcedure from '@/views/Change/ChangeAssignment/Update/Procedure'
import ViewChangeAssignmentResult from '@/views/Change/ChangeAssignment/Update/ChangeAssignmentResult'
import ViewOtherClassChangeAssignmentResult from '@/sections/Change/Assignment/OtherResultShow'
import ViewChangeEdit from '@/views/Change/Update/ChangeEdit'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import $option from '@/__reactnative_stone/global/option'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import S_User from '@/services/api/v1/user'
import moment from 'moment'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import ViewChangeAssignmentPreview from '@/views/Change/ChangeAssignment/Update/Preview'
import ViewDashboardChange from '@/views/DashboardFactory/Change'
import ViewDashboardChangeList from '@/views/DashboardFactory/DashboardChangeListTab'
const StackSetting = createStackNavigator()

const RouteChange = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)

  // Fields
  const fields = {
    name: {
      label: t('名稱'),
      rules: 'required'
    },
    owner: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
    },
    expired_date: {
      type: 'date',
      label: t('有效迄日'),
      rules: 'required'
    },
    system_classes: {
      type: 'belongstomany'
    },
    system_subclasses: {
      type: 'belongstomany'
    },
    attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/change_version/attach` : null
    }
  }
  const updateFields = {
    name: {
      label: t('名稱'),
      rules: 'required',
      editable: false
    },
    owner: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
    },
    expired_date: {
      type: 'date',
      label: t('到期日')
    },
    attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/change_version/attach` : null
    }
  }
  const stepSettings = [
    {
      // showFields: ['event_type', 'name', 'remark', 'occur_at', 'system_classes',],
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.change_type &&
          fieldsValue.change_type.show_fields
        ) {
          return ['name', ...fieldsValue.change_type.show_fields]
        } else {
          return ['name', 'owner', 'attaches']
        }
      }
    },
    {
      component: ChangeCreateStep,
      headerShown: true
    }
  ]
  const updateSetting = [
    {
      // showFields: ['event_type', 'name', 'remark', 'occur_at', 'system_classes',],
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.change_type &&
          fieldsValue.change_type.show_fields
        ) {
          return ['name', ...fieldsValue.change_type.show_fields]
        } else {
          return ['name', 'owner', 'attaches']
        }
      }
    },
    {
      component: ChangeUpdateStep,
      headerShown: false
    }
  ]
  const editSetting = [
    {
      // showFields: ['event_type', 'name', 'remark', 'occur_at', 'system_classes',],
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.change_type &&
          fieldsValue.change_type.show_fields
        ) {
          return ['name', ...fieldsValue.change_type.show_fields]
        } else {
          return ['name', 'owner', 'attaches', 'expired_date']
        }
      }
    }
  ]

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }}>
      <StackSetting.Screen
        name="ChangeIndex"
        component={scopeFilterScreen('change-read', ViewChangeIndex)}
        options={({ navigation }) => ({
          title: t('變動計畫列表'),
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
        name="ChangeShow"
        component={scopeFilterScreen('change-read', ViewChangeShow)}
        options={({ navigation }) => ({
          title: t('變動計畫'),
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
        name="ChangeCreate"
        component={scopeFilterScreen('change-create', WsStepRoutesCreate)}
        options={{
          title: t('建立變動計畫'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'ChangeCreate',
          title: t('建立變動計畫'),
          modelName: 'change',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'ChangeIndex',
          parentId: factory && factory.id,
          versionName: 'change_version',
          RouteName: 'RouteChange'
        }}
      />
      <StackSetting.Screen
        name="ChangeEdit"
        component={scopeFilterScreen([
          'change-update-creator',
          'change-update-owner',
          'change-update'
        ], ViewChangeEdit)}
        options={({ navigation }) => ({
          title: t('編輯變動計畫設定'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="ChangeUpdate"
        component={scopeFilterScreen([
          'change-update-creator',
          'change-update-owner',
          'change-update'
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('更新變動計畫'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'ChangeUpdate',
          title: t('更新變動計畫'),
          modelName: 'change_version',
          fields: updateFields,
          stepSettings: updateSetting,
          afterFinishingTo: 'ChangeShow',
          parentId: factory && factory.id
        }}
      />
      <StackSetting.Screen
        name="ChangeItemTemplateRemark"
        component={scopeFilterScreen(
          'change-read',
          ViewChangeItemTemplateRemark
        )}
        options={({ navigation }) => ({
          title: t('查看說明'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="AssignChange"
        component={scopeFilterScreen('change-record', CreateAssignChange)}
        options={({ navigation }) => ({
          title: t('指派評估作業'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="UpdateAssignChange"
        component={scopeFilterScreen('change-record', UpdateAssignChange)}
        options={({ navigation }) => ({
          title: t('指派評估作業'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="ChangeAssignmentIndex"
        component={scopeFilterScreen(
          'change-record',
          ViewChangeAssignmentIndex
        )}
        options={({ navigation }) => ({
          title: t('變動評估作業'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="ChangeAssignmentIntroduction"
        component={scopeFilterScreen('change-record', ViewChangeAssignmentIntroduction)}
        options={({ navigation }) => ({
          title: t('變動評估作業'),
          ...$option.headerOption,
          headerShown: true
        })}
      />
      <StackSetting.Screen
        name="ChangeAssignmentProcedure"
        component={scopeFilterScreen('change-record', ViewChangeAssignmentProcedure)}
        options={({ navigation }) => ({
          ...$option.headerOption,
          headerShown: false,
          gestureEnabled: false
        })}
      />
      <StackSetting.Screen
        name="ChangeAssignmentResult"
        component={scopeFilterScreen(
          'change-record',
          ViewChangeAssignmentResult
        )}
        options={({ navigation }) => ({
          title: t('變動評估結果'),
          ...$option.headerOption
        })}
      />

      <StackSetting.Screen
        name="ChangeAssignmentOtherResultShow"
        component={scopeFilterScreen(
          'change-record',
          ViewOtherClassChangeAssignmentResult
        )}
        options={({ navigation }) => ({
          title: t('變動評估結果'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="DashboardChange"
        component={scopeFilterScreen('change-read', ViewDashboardChange)}
        options={({ navigation }) => ({
          title: t('變動評估中'),
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
        name="DashboardChangeList"
        component={scopeFilterScreen('change-read', ViewDashboardChangeList)}
        options={({ navigation }) => ({
          title: t('變動評估中'),
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
        name="ChangeAssignmentPreview"
        component={scopeFilterScreen('change-record', ViewChangeAssignmentPreview)}
        options={({ navigation, route }) => ({
          title: t('變動評估作業'),
          ...$option.headerOption
        })}
      />


    </StackSetting.Navigator>
  )
}
export default RouteChange
