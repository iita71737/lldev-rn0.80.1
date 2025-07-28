import React from 'react'
import {
  Text,
  Alert,
  View,
  Platform,
  Button,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsHeaderBackBtn } from '@/components'
import {
  WsBtn,
  WsIconBtn,
  WsStepRoutesCreate,
  WsSubtaskCard,
  WsStepRoutesUpdate,
} from '@/components'
import ViewAct from '@/views/Act/Index'
import ViewActShow from '@/views/Act/Show'
import ViewActLibrary from '@/views/Act/ActLibrary/Show'
import ViewArticleHistory from '@/views/Act/ArticleHistory'
import ViewReferenceLinkPage from '@/views/Act/ReferenceLinkPage'
import ViewArticleShow from '@/views/Act/ArticleShow'
import ViewLegalAdvice from '@/views/Act/LegalAdvice'
import gOption from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import ActChangeReportShow from '@/views/Act/ActChangeReport/Show'
import $option from '@/__reactnative_stone/global/option'
import $color from '@/__reactnative_stone/global/color'
import ViewTaskShow from '@/views/Task/Show'
import ViewCheckListTemplateShow from '@/views/CheckList/Template/CheckListTemplateShow'
import ViewAuditTemplateShow from '@/views/Audit/Template/AuditTemplateShow'
import ViewContractorsLicenseTemplateShow from '@/views/Contractors/Template/ContractorLicenseTemplateShow'
import ViewTrainingTemplateShow from '@/views/Training/Template/TrainingTemplateShow'
import ViewLicenseShow from '@/views/License/Show'
import ViewAuditShow from '@/views/Audit/Show'
import ViewContractorsLicenseShow from '@/views/Contractors/ContractorsLicense/Show'
import ViewTrainingShow from '@/views/Training/Show'
import ViewGuidelineIndex from '@/views/ActGuideline/Index'
import ViewGuidelineShow from '@/views/ActGuideline/Show'
import ViewGuidelineManageIndex from '@/views/ActGuideline/GuidelineManage/Index'
import { useSelector } from 'react-redux'
import moment from 'moment'
import act_status from '@/services/api/v1/act_status'
import ViewGuidelineAdminShow from '@/views/ActGuideline/GuidelineManage/GuidelineAdminShow'
import AsyncStorage from '@react-native-community/async-storage'
import S_GuidelineAdmin from '@/services/api/v1/guideline_admin'
import S_GuidelineVersionAdmin from '@/services/api/v1/guideline_version_admin'
import store from '@/store'
import {
  setRefreshCounter,
} from '@/store/data'

const StackSetting = createStackNavigator()
const RoutesAct = () => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentActStatus = useSelector(state => state.data.actStatus)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  const fields = {
    name: {
      type: 'text',
      label: t('標題'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
    },
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
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
    announce_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('修正發布日'),
      rules: 'required'
    },
    effect_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('生效日'),
    },
    guideline_status: {
      type: 'belongsto002_CRUD',
      modelName: 'guideline_status',
      nameKey: 'name',
      serviceIndexKey: 'index',
      label: t('施行狀態'),
      translate: false,
      addIconLabel: t('新增施行狀態'),
      manageIconLabel: t('管理施行狀態'),
      parentId: factory ? factory.id : null,
      rules: 'required'
    },
    remark: {
      label: t('說明'),
      multiline: true,
      placeholder: t('輸入'),
    },
    file_attaches: {
      modelName: 'event',
      type: 'Ll_filesAndImages',
      label: t('附件'),
    },
    related_acts_articles: {
      type: 'Ll_relatedAct',
      label: t('關聯法規'),
      modelName: 'act',
      serviceIndexKey: 'index',
      parentId: factory ? factory.id : null,
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc',
        time_field: 'announce_at',
        act_status: currentActStatus ? currentActStatus[0].id : ''
      }
    },
    related_guidelines_articles: {
      type: 'Ll_relatedGuideline',
      label: t('相關內規'),
      modelName: 'guideline',
      serviceIndexKey: 'index',
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc'
      }
    },
    users: {
      type: 'belongstomany',
      label: t('檢閱權限-依成員'),
      placeholder: t('選擇'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      selectAllVisible: false,
      cancelAllVisible: false,
      searchBarVisible: true,
    },
    user_factory_roles_all: {
      type: 'multipleBelongstomany',
      label: t('權限-依角色'),
      placeholder: t('選擇'),
      nameKey: 'name',
      innerLabel: [t('自訂角色'), t('預設角色')],
      modelName: ['user_role', 'user_factory_role_template'],
      serviceIndexKey: 'index',
      hasMeta: false,
      selectAllVisible: false,
      cancelAllVisible: false,
      searchBarVisible: true,
    },
  }

  const fieldsCreateVersion = {
    name: {
      type: 'text',
      label: t('標題'),
      placeholder: `${t('請輸入')}${t('標題')}`,
      rules: 'required',
    },
    announce_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('修正發布日'),
      rules: 'required',
      getMinimumDate: fieldValue => {
        const _min = moment(fieldValue.announce_at, "YYYY-MM-DD").format("YYYY-MM-DD");
        return _min
      }
    },
    effect_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('生效日'),
      getMinimumDate: fieldValue => {
        const _min = moment(fieldValue.effect_at, "YYYY-MM-DD").format("YYYY-MM-DD");
        return _min
      }
    },
    remark: {
      label: t('說明'),
      multiline: true,
      placeholder: t('輸入'),
    },
    file_attaches: {
      modelName: 'event',
      type: 'Ll_filesAndImages',
      label: t('附件'),
    },
    related_acts_articles: {
      type: 'Ll_relatedAct',
      label: t('關聯法規'),
      modelName: 'act',
      serviceIndexKey: 'index',
      parentId: factory ? factory.id : null,
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc',
        time_field: 'announce_at',
        act_status: currentActStatus ? currentActStatus[0].id : ''
      }
    },
    related_guidelines_articles: {
      type: 'Ll_relatedGuideline',
      label: t('相關內規'),
      modelName: 'guideline',
      serviceIndexKey: 'index',
      parentId: factory ? factory.id : null,
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc'
      }
    },
  }

  const fieldsForNotLastVersion = {
    name: {
      type: 'text',
      label: t('標題'),
      placeholder: `${t('請輸入')}${t('標題')}`,
      rules: 'required',
    },
    announce_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('修正發布日'),
      rules: 'required',
    },
    effect_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('生效日'),
    },
    remark: {
      label: t('說明'),
      multiline: true,
      placeholder: t('輸入'),
      rules: 'required',
    },
    file_attaches: {
      modelName: 'event',
      type: 'Ll_filesAndImages',
      label: t('附件'),
    },
    related_acts_articles: {
      type: 'Ll_relatedAct',
      label: t('關聯法規'),
      modelName: 'act',
      serviceIndexKey: 'index',
      parentId: factory ? factory.id : null,
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc',
        time_field: 'announce_at',
        act_status: currentActStatus ? currentActStatus[0].id : ''
      }
    },
    related_guidelines_articles: {
      type: 'Ll_relatedGuideline',
      label: t('相關內規'),
      modelName: 'guideline',
      serviceIndexKey: 'index',
      parentId: factory ? factory.id : null,
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc'
      }
    }
  }

  const fieldsForEditNoVersion = {
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
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
    guideline_status: {
      type: 'belongsto002_CRUD',
      modelName: 'guideline_status',
      nameKey: 'name',
      serviceIndexKey: 'index',
      label: t('施行狀態'),
      translate: false,
      addIconLabel: t('新增施行狀態'),
      manageIconLabel: t('管理施行狀態'),
      parentId: factory ? factory.id : null,
      rules: 'required'
    },
    users: {
      type: 'belongstomany',
      label: t('檢閱權限-依成員'),
      placeholder: t('選擇'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      selectAllVisible: false,
      cancelAllVisible: false,
      searchBarVisible: true,
    },
    user_factory_roles_all: {
      type: 'multipleBelongstomany',
      label: t('權限-依角色'),
      placeholder: t('選擇'),
      nameKey: 'name',
      innerLabel: [t('自訂角色'), t('預設角色')],
      modelName: ['user_role', 'user_factory_role_template'],
      serviceIndexKey: 'index',
      hasMeta: false,
      selectAllVisible: false,
      cancelAllVisible: false,
      searchBarVisible: true,
    },
  }

  // 建立內規
  const submitForCreate = async (_postData, navigation) => {
    // console.log(JSON.stringify(_postData), '_postData submitForCreate');
    const _data = S_GuidelineAdmin.formattedDataForCreate(_postData, currentUser)
    // console.log(JSON.stringify(_data), '_data submitForCreate');
    try {
      const res = await S_GuidelineAdmin.create({
        data: _data
      })
      if (res) {
        // Alert.alert(t('內規建立成功'))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: res.id
          }
        })
      }
      // await AsyncStorage.removeItem('GuidelineCreate')
    } catch (e) {
      Alert.alert(t('內規建立異常'))
      console.error(e.message, 'submitForCreate')
      navigation.navigate('RoutesAct', {
        screen: 'GuidelineAdminIndex'
      })
    }
  }

  // 編輯內規版本
  const submitForEdit = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    // console.log(versionId, '=versionId=');
    console.log(JSON.stringify(_formattedValue), '_formattedValue--');
    const _data = S_GuidelineVersionAdmin.formattedDataForEdit(_formattedValue, currentUserId)
    console.log(JSON.stringify(_data), 'S_GuidelineVersionAdmin.update');
    try {
      const res = await S_GuidelineVersionAdmin.update({
        modelId: versionId,
        data: _data
      })
      if (res) {
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'GuidelineAdminIndex',
            },
            {
              name: 'GuidelineAdminShow',
              params: {
                id: modelId,
                refreshKey: Date.now()
              }
            },
          ],
          key: null
        })
      }
    } catch (e) {
      Alert.alert('編輯內規異常')
      console.error(e.message, 'submitForEdit')
      navigation.navigate('GuidelineAdminIndex', {})
    }
  }

  // 建立內規版本(更版)
  const submitForCreateVersion = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    // console.log(modelId, '=modelId=');
    // console.log(JSON.stringify(_formattedValue), '_formattedValue--');
    const _data = S_GuidelineVersionAdmin.formattedDataForCreateVersion(_formattedValue, currentUserId)
    // console.log(JSON.stringify(_data), 'formattedDataForCreateVersion');
    try {
      const res = await S_GuidelineVersionAdmin.create({
        data: {
          ..._data,
          guideline: modelId
        }
      })
      if (res) {
        // console.log(res,'res---');
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: modelId
          }
        })
      }
    } catch (e) {
      Alert.alert(t('內規更版異常'))
      console.error(e.message, 'submitForCreateVersion')
      navigation.navigate('GuidelineAdminIndex', {})
    }
  }

  // 編輯內規
  const submitForEditNoVersion = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    // console.log(modelId,'modelId');
    // console.log(JSON.stringify(_postData), '_postData submitForEditNoVersion');
    const _data = S_GuidelineAdmin.formattedDataForEdit(_formattedValue)
    try {
      const res = await S_GuidelineAdmin.update({
        modelId: modelId,
        data: _data
      })
      if (res) {
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: res.id
          }
        })
      }
      // await AsyncStorage.removeItem('GuidelineAdminUpdateNoVersion')
    } catch (e) {
      Alert.alert(t('編輯內規異常'))
      console.error(e.message, 'submitForEditNoVersion')
      navigation.navigate('RoutesAct', {
        screen: 'GuidelineAdminIndex'
      })
    }
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
            'has_unreleased',
            'name',
            'owner',
            'factory_tags',
            'announce_at',
            'effect_at',
            'guideline_status',
            'remark',
            'file_attaches',
            'related_acts_articles',
            'related_guidelines_articles',
            'users',
            'user_factory_roles_all'
          ]
        }
      }
    }
  ]

  return (
    <>
      <StackSetting.Navigator
        initialRouteName="Act"
        screenOptions={{
          headerBackTitleVisible: false
        }}>
        <StackSetting.Screen
          name="ActIndex"
          component={scopeFilterScreen('act-read', ViewAct)}
          options={({ navigation }) => ({
            title: t('法規'),
            headerShown: false,
            ...gOption.headerOption,
          })}
        />
        <StackSetting.Screen
          name="ActShow"
          component={scopeFilterScreen('act-read', ViewActShow)}
          options={{
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="ActChangeReportShow"
          component={scopeFilterScreen('act-read', ActChangeReportShow)}
          options={({ navigation }) => ({
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
          })}
        />
        <StackSetting.Screen
          name="ActLibraryShow"
          component={scopeFilterScreen('act-read', ViewActLibrary)}
          options={{
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="ArticleHistory"
          component={scopeFilterScreen('act-read', ViewArticleHistory)}
          options={{
            title: t('沿革'),
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="ReferenceLinkPage"
          component={scopeFilterScreen('act-read', ViewReferenceLinkPage)}
          options={{
            title: t('法規內容'),
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="ArticleShow"
          component={scopeFilterScreen('act-read', ViewArticleShow)}
          options={{
            title: t('法條內容'),
            ...gOption.headerOption,
            gestureEnabled: false
          }}
        />
        <StackSetting.Screen
          name="LegalAdvice"
          component={ViewLegalAdvice}
          options={{
            title: t('法律諮詢'),
            ...gOption.headerOption
          }}
        />

        <StackSetting.Screen
          name="GuidelineIndex"
          component={scopeFilterScreen('guideline-read', ViewGuidelineIndex)}
          options={({ navigation }) => ({
            title: t('內規'),
            headerShown: false,
            ...gOption.headerOption,
          })}
        />
        <StackSetting.Screen
          name="GuidelineShow"
          component={scopeFilterScreen('guideline-read', ViewGuidelineShow)}
          options={{
            title: t('內規'),
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="GuidelineAdminIndex"
          component={scopeFilterScreen('guideline-admin-read', ViewGuidelineManageIndex)}
          options={({ navigation }) => ({
            title: t('內規管理'),
            // headerShown: false,
            ...gOption.headerOption,
          })}
        />
        <StackSetting.Screen
          name="GuidelineAdminCreate"
          component={scopeFilterScreen('guideline-admin-create', WsStepRoutesCreate)}
          options={{
            title: t('新增內規'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'GuidelineAdminCreate',
            title: t('新增內規'),
            modelName: 'guideline',
            fields: fields,
            stepSettings: stepSettings,
            submitFunction: submitForCreate,
          }}
        />
        <StackSetting.Screen
          name="GuidelineAdminUpdate"
          component={scopeFilterScreen(['guideline-admin-update', 'guideline-admin-update-owner'], WsStepRoutesUpdate)}
          options={{
            title: t('編輯內規'), // 編輯內規版本
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'GuidelineAdminUpdate',
            title: t('編輯內規'), // 編輯內規版本
            modelName: 'guideline',
            fields: fields,
            stepSettings: stepSettings,
            submitFunction: submitForEdit,
          }}
        />
        <StackSetting.Screen
          name="GuidelineAdminUpdateNotLastVersion"
          component={scopeFilterScreen(['guideline-admin-update', 'guideline-admin-update-owner'], WsStepRoutesUpdate)}
          options={{
            title: t('編輯內規版本-非最新版本'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'GuidelineAdminUpdateNotLastVersion',
            title: t('編輯內規版本-非最新版本'),
            modelName: 'guideline',
            fields: fieldsForNotLastVersion,
            stepSettings: stepSettings,
            submitFunction: submitForEdit,
            afterFinishingTo: 'GuidelineAdminIndex',
          }}
        />
        <StackSetting.Screen
          name="GuidelineAdminUpdateVersion"
          component={scopeFilterScreen('guideline-admin-create', WsStepRoutesUpdate)}
          options={{
            title: t('建立內規新版本'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'GuidelineAdminUpdateVersion',
            title: t('建立內規新版本'),
            modelName: 'guideline',
            fields: fieldsCreateVersion,
            stepSettings: stepSettings,
            submitFunction: submitForCreateVersion,
            afterFinishingTo: 'GuidelineAdminIndex',
          }}
        />
        <StackSetting.Screen
          name="GuidelineAdminShow"
          component={scopeFilterScreen('guideline-admin-create', ViewGuidelineAdminShow)}
          options={{
            title: t('內規管理'),
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="GuidelineAdminUpdateNoVersion"
          component={scopeFilterScreen('guideline-admin-update', WsStepRoutesUpdate)}
          options={{
            title: t('編輯內規'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'GuidelineAdminUpdateNoVersion',
            title: t('編輯內規'),
            modelName: 'guideline',
            fields: fieldsForEditNoVersion,
            stepSettings: stepSettings,
            submitFunction: submitForEditNoVersion,
            afterFinishingTo: 'GuidelineAdminIndex',
          }}
        />
      </StackSetting.Navigator>
    </>
  )
}

export default RoutesAct
