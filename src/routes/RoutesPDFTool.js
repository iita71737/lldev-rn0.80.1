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
  WsFlex,
  WsDes,
  WsText,
  WsIcon
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
import S_MeetingTemplate from '@/services/api/v1/meeting_template'
import store from '@/store'
import {
  setRefreshCounter,
} from '@/store/data'
import PDFToolAdminIndex from '@/views/PDFTool/PDFToolAdminIndex'
import PDFToolAdminShow from '@/views/PDFTool/PDFToolAdminShow'
import H_time from '@/helpers/time';
import PDFToolAdminTemplateShow from '@/views/PDFTool/PDFToolAdminTemplateShow'
import PDFToolAdminExportShow from '@/views/PDFTool/PDFToolAdminExportShow'
import PDFToolAdminBatchEditMeetingItemGroup from '@/views/PDFTool/PDFToolAdminBatchEditMeetingItemGroup'
const StackSetting = createStackNavigator()
import S_Meeting from '@/services/api/v1/meeting'

const RoutesPDFTool = () => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentActStatus = useSelector(state => state.data.actStatus)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentMeetingTemplateType = useSelector(state => state.data.meetingTemplateTypes)

  const meetingItemTemplateTypeId = Array.isArray(currentMeetingTemplateType)
    ? currentMeetingTemplateType.find(item => item?.value === 'meeting_item')?.id
    : null
  const meetingTemplateTypeId = Array.isArray(currentMeetingTemplateType)
    ? currentMeetingTemplateType.find(item => item?.value === 'meeting')?.id
    : null
  const contentsTemplateTypeId = Array.isArray(currentMeetingTemplateType)
    ? currentMeetingTemplateType.find(item => item?.value === 'table_of_contents')?.id
    : null
  const coverTemplateTypeId = Array.isArray(currentMeetingTemplateType)
    ? currentMeetingTemplateType.find(item => item?.value === 'cover')?.id
    : null

  const fields = {
    name: {
      type: 'text',
      label: t('標題'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
    },
    chairperson: {
      label: t('主席'),
      placeholder: t('輸入'),
    },
    meeting_date: {
      type: 'datetime',
      placeholder: t('YYYY-MM-DD HH:mm'),
      label: t('時間'),
      // rules: 'required',
    },
    date_format: {
      type: 'belongsto',
      label: t('時間格式'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'data_format',
      serviceIndexKey: 'index',
      // rules: 'required',
      updateValueOnChange: (event, value, field, fields) => {
        console.log(event, 'event222')
        console.log(value, 'value222')
        if (event?.value === 'roc_format') {
          value.meeting_date_format = H_time.getRocChineseDateTime(value.meeting_date, false, 'Asia/Taipei');
          return value
        } else if (event?.value === 'default') {
          value.meeting_date_format = value.meeting_date
          return value
        }
      },
    },
    meeting_date_format: {
      multiline: true,
      placeholder: t('YYYY-MM-DD HH:mm'),
    },
    location: {
      label: t('地點'),
      multiline: true,
      placeholder: t('輸入'),
    },
    meeting_item_template: {
      type: 'belongsto',
      label: t('提案​單範本​'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'meeting_template',
      serviceIndexKey: 'index',
      hasMeta: false,
      params: {
        meeting_template_type: meetingItemTemplateTypeId
      }
    },
    meeting_template: {
      type: 'belongsto',
      label: t('議程範本'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'meeting_template',
      serviceIndexKey: 'index',
      hasMeta: false,
      params: {
        meeting_template_type: meetingTemplateTypeId
      }

    },
    contents_template: {
      type: 'belongsto',
      label: t('目錄​範本​'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'meeting_template',
      serviceIndexKey: 'index',
      hasMeta: false,
      params: {
        meeting_template_type: contentsTemplateTypeId
      }
    },
    cover_template: {
      type: 'belongsto',
      label: t('封面範本'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'meeting_template',
      serviceIndexKey: 'index',
      hasMeta: false,
      params: {
        meeting_template_type: coverTemplateTypeId
      }
    },
    item_label_type: {
      type: 'belongsto',
      label: t('項目符號'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'item_label_type',
      serviceIndexKey: 'index',
      hasMeta: false,
    },
    owner: {
      type: 'belongsto',
      label: t('負責人'),
      placeholder: `${t('選擇')}`,
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
      style: {
        borderTopWidth: 1,
        paddingTop: 8,
        marginTop: 8
      },
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
    users: {
      type: 'belongstomany',
      label: `${t('限閱人員')}`,
      nameKey: 'name',
      valueKey: 'id',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      // rules: 'required'
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
    },
    file_attaches: {
      modelName: 'meeting',
      type: 'Ll_filesAndImages',
      label: t('附件'),
      canOrder: true
    },
    sign_in_form: {
      modelName: 'meeting',
      type: 'Ll_filesAndImages',
      label: t('簽到表'),
      oneFile: true
    }
  }

  const fieldsForTemplate = {
    file_attaches: {
      modelName: 'meeting_template',
      type: 'Ll_filesAndImages',
      label: t('範本'),
      oneFile: true,
      // rules: 'allMarkSetting',
      limitFileExtension: ['docx', 'xlsx'],
      remind: t('注意，​重新​上​傳​範本，​會覆​蓋標記​設定​'),
      remindColor: $color.danger,
      remind002: t('範本注意事項'),
      remind002Color: $color.primary,
      remindBtnDisabled002: false,
      remindRenderItem002: () => {
        return (
          <>
            <View style={{ marginHorizontal: 16, paddingBottom: 16 }}>
              <WsText size={14} fontWeight="600" style={{ marginBottom: 8 }}>
                {t('通用')}
              </WsText>
              <WsFlex flexWrap="wrap">
                <WsDes size={14}>{`1. ${t('標記只能為英文大小寫及數字')}`}</WsDes>
              </WsFlex>
              <WsFlex flexWrap="wrap" style={{ marginTop: 4 }}>
                <WsDes size={14}>{`2. ${t('標記設定的名稱需要跟範本內的名稱相同')}`}</WsDes>
              </WsFlex>

              <WsText size={14} fontWeight="600" style={{ marginTop: 16, marginBottom: 8 }}>
                {t('議程範本')}
              </WsText>
              <WsFlex flexWrap="wrap">
                <WsDes size={14}>{`1. ${t('範本最上面加上標記${top}')}`}</WsDes>
              </WsFlex>
              <WsFlex flexWrap="wrap" style={{ marginTop: 4 }}>
                <WsDes size={14}>{`2. ${t('議案群組區塊：需要使用標記包起來，且標記要與標題不同行')}`}</WsDes>
              </WsFlex>
              <WsFlex flexWrap="wrap" style={{ marginTop: 4 }}>
                <WsDes size={14}>{`3. ${t('說明(內容)：標記要與標題不同行')}`}</WsDes>
              </WsFlex>
              <WsFlex flexWrap="wrap" style={{ marginTop: 4 }}>
                <WsDes size={14}>{`4. ${t('換行需要按enter')}`}</WsDes>
              </WsFlex>
            </View>
          </>
        )
      },
    },
    name: {
      type: 'text',
      label: t('標題'),
      placeholder: `${t('輸入')}`,
      rules: 'required',
    },
    meeting_template_type: {
      type: 'belongsto',
      label: t('範本類型'),
      nameKey: 'name',
      modelName: 'meeting_template_type',
      serviceIndexKey: 'index',
      hasMeta: false,
      rules: 'required'
    },
    remark: {
      label: t('備註'),
      multiline: true,
      placeholder: t('輸入'),
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
  }

  // add meeting
  const submitForCreateMeeting = async (_postData, navigation) => {
    // console.log(JSON.stringify(_postData), '_postData submitForCreateMeeting');
    const _data = S_Meeting.formattedDataForCreate(_postData, currentUser)
    // console.log(JSON.stringify(_data), '_data submitForCreateMeeting');
    try {
      const res = await S_Meeting.create({
        data: _data
      })
      if (res) {
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'PDFToolAdminIndex',
              params: {
                initTabIndex: 1
              }
            },
            {
              name: 'PDFToolAdminShow',
              params: {
                id: res.id,
                initTabIndex: 0
              }
            }
          ],
          key: null
        })
      }
    } catch (e) {
      Alert.alert(t('議事建立異常'))
      console.error(e.message, 'submitForCreateMeeting')
      navigation.navigate('RoutesPDFTool', {
        screen: 'PDFToolAdminIndex'
      })
    }
  }

  // 編輯議事
  const submitForEditMeeting = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    // console.log(JSON.stringify(_formattedValue), '_formattedValue--');
    const _data = S_Meeting.formattedDataForEdit(_formattedValue)
    // console.log(JSON.stringify(_data), 'submitForEditMeeting');
    try {
      const stored = await AsyncStorage.getItem('PDFToolAdminUpdate')
      const prev = stored ? JSON.parse(stored) : null
      const prevContentsId = prev?.contents_template ?? prev?.contents_template
      const prevMeetingId = prev?.meeting_template ?? prev?.meeting_template
      const nextContentsId = _formattedValue?.contents_template ?? _formattedValue?.contents_template
      const nextMeetingId = _formattedValue?.meeting_template ?? _formattedValue?.meeting_template
      const isTemplateChanged =
        (prevContentsId && nextContentsId && prevContentsId !== nextContentsId) ||
        (prevMeetingId && nextMeetingId && prevMeetingId !== nextMeetingId)
      // console.log(isTemplateChanged, 'isTemplateChangedisTemplateChanged')
      const res = await S_Meeting.update({
        modelId: modelId,
        data: _data
      })
      if (res) {
        const meetingId = res?.id ?? modelId
        if (isTemplateChanged) {
          Alert.alert(
            t('目錄範本或議程範本有異動，要批次編輯議案群組的對應的目錄範本區塊及對應的議程範本區塊嗎？'),
            '',
            [
              {
                text: t('否'),
                style: 'cancel',
                onPress: () => {
                  navigation.replace('RoutesPDFTool', {
                    screen: 'PDFToolAdminShow',
                    params: { id: meetingId }
                  })
                },
              },
              {
                text: t('是'),
                onPress: () => {
                  navigation.replace('RoutesPDFTool', {
                    screen: 'PDFToolAdminBatchEditMeetingItemGroup',
                    params: { id: meetingId }
                  })
                },
              },
            ]
          )
          return
        }
        navigation.replace('RoutesPDFTool', {
          screen: 'PDFToolAdminShow',
          params: {
            id: meetingId
          }
        })
      }
    } catch (e) {
      Alert.alert(t('編輯議事異常'))
      console.error(e.message, 'submitForEditNoVersion')
      navigation.navigate('RoutesPDFTool', {
        screen: 'PDFToolAdminIndex'
      })
    }
  }

  // add template
  const submitForCreateTemplate = async (_postData, navigation) => {
    // console.log(JSON.stringify(_postData), '_postData submitForCreateTemplate');
    const _data = S_MeetingTemplate.formattedDataForCreate(_postData, currentUser)
    // console.log(JSON.stringify(_data), '_data submitForCreateTemplate');
    try {
      const res = await S_MeetingTemplate.create({
        data: _data
      })
      if (res) {
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'PDFToolAdminIndex',
              params: {
                initTabIndex: 1
              }
            },
            {
              name: 'PDFToolAdminTemplateShow',
              params: {
                id: res.id,
              }
            }
          ],
          key: null
        })
      }
    } catch (e) {
      Alert.alert(t('範本建立異常'))
      console.error(e.message, 'submitForCreateTemplate')
      navigation.navigate('RoutesPDFTool', {
        screen: 'PDFToolAdminIndex'
      })
    }
  }

  // 編輯內規版本
  const submitForEditTemplate = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) => {
    // console.log(JSON.stringify(_formattedValue), '_formattedValue--');
    const _data = S_MeetingTemplate.formattedMeetingTemplateForEdit(_formattedValue, currentUserId)
    console.log(modelId, 'modelId')
    console.log(JSON.stringify(_data), 'S_GuidelineVersionAdmin.update');
    try {
      const res = await S_MeetingTemplate.update({
        modelId: modelId,
        data: _data
      })
      if (res) {
        navigation.replace('RoutesPDFTool', {
          screen: 'PDFToolAdminTemplateShow',
          params: {
            id: res.id
          }
        })
      }
      if (res?.meeting_template_type?.value === 'meeting' || res?.meeting_template_type?.value === 'table_of_contents') {
        Alert.alert(
          t('目錄範本或議程範本有異動，需要重新設定各議案群組對應的目錄範本區塊及對應的議程範本區塊'),
          undefined,
          [{ text: t('知道了') }]
        )
      }
    } catch (e) {
      Alert.alert(t('編輯範本異常'))
      console.error(e.message, 'submitForEditTemplate')
      navigation.navigate('PDFToolAdminIndex', {})
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
            'owner',
            'expired_at',
            'chairperson',
            'meeting_date',
            'date_format',
            'meeting_date_format',
            'location',
            'file_attaches',
            'users',
            'roles',
            'remark',
            'meeting_item_template',
            'meeting_template',
            'contents_template',
            'cover_template',
            'item_label_type',
            'factory_tags',
            'meeting_template_type',
            'sign_in_form'
          ]
        }
      }
    }
  ]

  return (
    <>
      <StackSetting.Navigator
        initialRouteName="PDFToolAdminIndex"
        screenOptions={{
          headerBackTitleVisible: false
        }}>

        <StackSetting.Screen
          name="PDFToolAdminIndex"
          component={scopeFilterScreen('guideline-admin-read', PDFToolAdminIndex)}
          options={({ navigation }) => ({
            title: t('議事管理'),
            ...gOption.headerOption,
            headerShown: false,
          })}
        />

        <StackSetting.Screen
          name="PDFToolAdminCreate"
          component={scopeFilterScreen('guideline-admin-create', WsStepRoutesCreate)}
          options={{
            title: t('新增議事'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'PDFToolAdminCreate',
            title: t('新增議事'),
            modelName: 'meeting',
            fields: fields,
            stepSettings: stepSettings,
            submitFunction: submitForCreateMeeting,
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminUpdate"
          component={scopeFilterScreen('guideline-admin-create', WsStepRoutesUpdate)}
          options={{
            title: t('編輯議事'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'PDFToolAdminUpdate',
            title: t('編輯議事'),
            modelName: 'meeting',
            fields: fields,
            stepSettings: stepSettings,
            submitFunction: submitForEditMeeting
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminCreateTemplate"
          component={scopeFilterScreen('guideline-admin-create', WsStepRoutesCreate)}
          options={{
            title: t('新​增​範本​'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'PDFToolAdminCreateTemplate',
            title: t('新​增​範本​'),
            modelName: 'meeting_template',
            fields: fieldsForTemplate,
            stepSettings: stepSettings,
            submitFunction: submitForCreateTemplate,
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminShow"
          component={scopeFilterScreen('guideline-admin-create', PDFToolAdminShow)}
          options={{
            title: t('議事內頁'),
            ...gOption.headerOption
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminTemplateShow"
          component={scopeFilterScreen('guideline-admin-create', PDFToolAdminTemplateShow)}
          options={{
            title: t('範本內頁'),
            ...gOption.headerOption
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminBatchEditMeetingItemGroup"
          component={scopeFilterScreen('guideline-admin-create', PDFToolAdminBatchEditMeetingItemGroup)}
          options={{
            title: t('批次編輯議案群組頁'),
            headerShown: false,
            ...$option.headerOption
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminTemplateEdit"
          component={scopeFilterScreen('guideline-admin-create', WsStepRoutesUpdate)}
          options={{
            title: t('編輯範本'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'PDFToolAdminTemplateEdit',
            title: t('編輯範本'),
            modelName: 'meeting_template',
            fields: fieldsForTemplate,
            stepSettings: stepSettings,
            submitFunction: submitForEditTemplate,
          }}
        />

        <StackSetting.Screen
          name="PDFToolAdminExportShow"
          component={scopeFilterScreen('guideline-admin-create', PDFToolAdminExportShow)}
          options={{
            title: t('匯出紀錄內頁'),
            ...gOption.headerOption
          }}
        />

      </StackSetting.Navigator>
    </>
  )
}

export default RoutesPDFTool
