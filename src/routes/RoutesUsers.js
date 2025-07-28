import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsHeaderBackBtn } from '@/components'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsRoutesRead
} from '@/components'
import ViewMoreScopesSetting from '@/views/Users/MoreScopesSetting'
import ViewUsersIndex from '@/views/Users/Index'
import ViewUserCreate from '@/views/Users/Create'
import ViewRolesIndex from '@/views/Roles/Index'
import ViewRolesShowDefault from '@/views/Roles/ShowDefault'
import ViewRolesShowCustom from '@/views/Roles/ShowCustom'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import $option from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import M_Users from '@/models/users'
import M_RoleScope from '@/models/role-scope'
import C_UserFactoryRole from '@/services/api/v1/user_factory_role'
const StackSetting = createStackNavigator()
import S_User from '@/services/api/v1/user'

const RoutesUsers = () => {
  const { t, i18n } = useTranslation()

  const userCreateField = {
    name: {
      label: t('人員名稱'),
      placeholder: t('輸入')
    },
    email: {
      type: 'email',
      label: t('信箱'),
      placeholder: t('輸入'),
      rules: 'email'
    },
    user_factory_role_templates: {
      type: 'multipleBelongstomany',
      label: t('角色設定'),
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
    user_factory_system_subclass: {
      type: 'modelsSystemClass',
      label: t('領域'),
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue &&
          fieldsValue.user_factory_role_templates &&
          fieldsValue.user_factory_role_templates.length > 0
        ) {
          return true
        }
      }
    },
    user_organization_factory_scope: {
      type: 'belongstomany002',
      label: t('限閱轄下單位'),
      nameKey: 'name',
      modelName: 'factory',
      serviceIndexKey: 'indexAll',
      displayCheck(fieldsValue) {
        if (fieldsValue &&
          fieldsValue.user_factory_role_templates &&
          fieldsValue.user_factory_role_templates.length > 0
        ) {
          return true
        }
      }
    },
  }

  const hideHeaderRoutes = ['RoutesAudit']
  const isHeaderVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    if (!routeName) {
      return true
    }
    return hideHeaderRoutes.includes(routeName)
  }

  const setRoutesUsersTabBarVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    const hideOnScreens = ['AuditShow', 'AuditCreate', 'AuditRecordsShow']
    if (hideOnScreens.indexOf(routeName) > -1) {
      return false
    } else {
      return true
    }
  }

  const stepSettings = [
    {
      getShowFields(value) {
        if (value && value.users_type && value.users_type.show_fields) {
          return [...value.users_type.show_fields]
        } else {
          return [
            'name',
            'email',
            'user_factory_role_templates',
            'user_factory_system_subclass',
            'user_organization_factory_scope'
          ]
        }
      }
    }
  ]

  // 新增人員
  const $_submitCreate = async (_postData, navigation) => {
    // console.log(_postData, '_postData--');
    navigation.reset({
      index: 1,
      routes: [
        {
          name: 'UsersIndex'
        },
        {
          name: 'MoreScopesSetting',
          params: {
            selectedUser: _postData,
            refreshKey: Date.now()
          }
        }
      ],
    });
    // const _user = await S_User.create(_userData)
    // const _data = S_License.getDataForCreateLicense(_postData, systemClasses)
    // const _versionData = S_License.getDataForCreateLicenseVersion(_postData, factory)
    // console.log(JSON.stringify(_versionData), '_versionData');
    // const license = await S_License.create({
    //   parentId: factory && factory.id,
    //   data: _data
    // })
    // const licenseId = license.id
    // const version = await S_LicenseVersion.create({
    //   modelId: licenseId,
    //   parentId: factory && factory.id,
    //   data: _versionData
    // })

    // Promise.all([_user, _user_factory_scope, _user_factory_system_subclass, _verify_email_request, _user_organization_factory_scope])
    //   .then(res => {
    //     Alert.alert(t('新增成員成功'))
    //     navigation.reset({
    //       index: 0,
    //       routes: [
    //         {
    //           name: 'UsersIndex'
    //         },
    //       ],
    //       key: null
    //     })
    //   })
    //   .catch(reason => {
    //     Alert.alert(t('新增成員異常'))
    //     navigation.navigate({
    //       name: 'UsersIndex'
    //     })
    //   })
  }

  const $_roleCreateSubmit = async value => {
    const _scopes = []
    for (let key in value) {
      if (Array.isArray(value[key])) {
        value[key].forEach(roles => {
          roles.forEach(scope => {
            _scopes.push(scope)
          })
        })
      }
    }
    const _submitData = {
      sequence: value.sequence,
      name: value.name,
      scopes: _scopes,
      is_default: 0
    }
    const res = await C_UserFactoryRole.create({ data: _submitData })
  }


  return (
    <StackSetting.Navigator
      screenOptions={({ route }) => ({
        headerBackTitleVisible: false,
        headerShown: isHeaderVisible(route),
        tabBarVisible: setRoutesUsersTabBarVisible(route)
      })}
      initialRouteName="UsersIndex"
    >
      <StackSetting.Screen
        name="UsersIndex"
        component={ViewUsersIndex}
        options={{
          headerShown: false,
          ...$option.headerOption
        }}
      />
      <StackSetting.Screen
        name="MoreScopesSetting"
        component={scopeFilterScreen([
          'role-update-creator',
          'role-update-owner',
          'role-update',
        ], ViewMoreScopesSetting)}
        options={{
          title: t('更多權限設定'),
          ...$option.headerOption
        }}
      />
      <StackSetting.Screen
        name="UsersCreate"
        component={scopeFilterScreen('role-create', WsStepRoutesCreate)}
        options={{
          title: t('新增成員'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'UsersCreate',
          title: t('新增成員'),
          modelName: 'user',
          fields: userCreateField,
          stepSettings: stepSettings,
          afterFinishingTo: 'UsersIndex',
          submitFunction: $_submitCreate,
          headerRightBtnText: t('下一步')
        }}
      />
      <StackSetting.Screen
        name="RolesIndex"
        component={scopeFilterScreen('role-read', ViewRolesIndex)}
        options={{
          headerShown: false,
          title: t('角色管理'),
          ...$option.headerOption
        }}
      />
      <StackSetting.Screen
        name="RolesCreate"
        component={scopeFilterScreen('role-create', ViewMoreScopesSetting)}
        component={WsStepRoutesCreate}
        options={{
          headerShown: false,
          title: t('新增角色'),
          ...$option.headerOption
        }}
        initialParams={{
          name: 'RolesCreate',
          title: t('新增角色'),
          modelName: 'user_factory_role',
          fields: M_RoleScope.getFields(),
          afterFinishingTo: 'RolesIndex',
          submitFunction: $_roleCreateSubmit
        }}
      />
      <StackSetting.Screen
        name="RoleUpdate"
        component={scopeFilterScreen([
          'role-update-creator',
          'role-update-owner',
          'role-update',
        ], WsStepRoutesUpdate)}
        component={WsStepRoutesUpdate}
        options={({ navigation }) => ({
          title: t('編輯角色'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'RoleUpdate',
          title: t('編輯角色'),
          modelName: 'user_factory_role',
          fields: M_RoleScope.getFields(),
          afterFinishingTo: 'RolesShowCustom',
        }}
      />
      <StackSetting.Screen
        name="RolesShowDefault"
        component={scopeFilterScreen('role-read', ViewRolesShowDefault)}
        options={{
          title: t('預設角色'),
          ...$option.headerOption
        }}
        initialParams={
          {
          }
        }
      />
      <StackSetting.Screen
        name="RolesShowCustom"
        component={scopeFilterScreen('role-read', ViewRolesShowCustom)}
        options={{
          title: t('自訂角色'),
          ...$option.headerOption
        }}
        initialParams={{
          modelName: 'user_factory_role',
          editable: false
        }}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesUsers
