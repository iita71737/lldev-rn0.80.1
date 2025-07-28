import React from 'react'
import { Alert, Dimensions } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import ViewLicenseIndex from '@/views/License/Index'
import ViewLicenseShow from '@/views/License/Show'
import ViewLicenseTemplateShow from '@/views/License/Template/LicenseTemplateShow'
import ViewLicensePickTypeTemplate from '@/views/License/Create/PickTypeTemplate'
import ViewLicensePickTemplate from '@/views/License/Create/PickTemplate'
import ViewIndexWithTemplate from '@/views/License/IndexWithTemplate'
import ViewIndexWithLicenseType from '@/views/License/IndexWithLicenseType'
import ViewLicenseUpdateVersion from '@/views/License/UpdateVersion'
import S_LicenseVersion from '@/services/api/v1/license_version'
import S_License from '@/services/api/v1/license'
import $option from '@/__reactnative_stone/global/option'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { WsStepRoutesCreate, WsStepRoutesUpdate, WsIconBtn } from '@/components'
import moment from 'moment'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import ViewDashboardLicenseExpired from '@/views/DashboardFactory/LicenseExpired'
import ViewDashboardLicenseExpiredList from '@/views/DashboardFactory/DashboardLicenseExpiredListTab'
import PickTypeTemplate from '@/views/License/Create/PickTypeTemplate'

const StackSetting = createStackNavigator()
const RoutesLicense = () => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // redux
  const factory = useSelector(state => state.data.currentFactory)
  const systemClasses = useSelector(state => state.data.systemClasses)

  // Fields
  const fields = {
    license_type: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'license_type',
      parentId: factory && factory.id,
      rules: 'required',
      renderCustomizedCom: PickTypeTemplate,
      editableDependOnValue(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.name &&
          fieldsValue.license_type.name == t('其他')
        )
          return false
      },
      displayCheck(fieldsValue) {
        // 250526-issue
        return false
      }
    },
    license_template: {
      type: 'belongsto',
      label: t('公版名稱'),
      nameKey: 'name',
      modelName: 'license_template',
      parentId: factory && factory.id,
      editable: false,
      displayCheck(fieldsValue) {
        if (fieldsValue.license_template) {
          return true
        } else {
          return false
        }
      }
    },
    name: {
      label: t('名稱'),
      rules: 'required'
    },
    system_classes: {
      type: 'belongstomany'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: t('選擇'),
      rules: 'required'
    },
    file_image: {
      modelName: 'license',
      label: t('證照圖檔'),
      type: 'Ll_filesAndImages',
      limitFileExtension: 'tiff,psd,jpg,png,gif,bmp,jpeg,heic', //副檔名 
      oneFile: true,
      uploadBtnText: t('上傳'),
    },
    using_status: {
      type: 'radio',
      label: t('使用狀態'),
      items: [
        { label: t('使用中'), value: 1 },
        { label: t('已停用'), value: 0 }
      ],
      defaultValue: 1,
      rules: 'required'
    },
    license_status_number: {
      label: t('辦理狀態'),
      type: 'radio',
      items: [
        { label: t('已核准'), value: 1 },
        { label: t('辦理中'), value: 2 }
      ],
      defaultValue: 1,
      rules: 'required'
    },
    // 證照持有人(選擇顯示工廠名稱或單選人員)(對照後台）)
    license_owner: {
      type: 'switchBelongto',
      label: t('證照持有人或持有單位'),
      switchTextInputItemLabel: [
        {
          editable: false,
          type: 'belongsto',
          nameKey: 'name',
          modelName: 'factory',
          serviceIndexKey: 'index',
          label: t('工廠'),
          value: 1,
        },
        {
          type: 'belongsto',
          nameKey: 'name',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
          label: t('人員'),
          value: 2
        }
      ],
      rules: 'required',
      placeholder: t('持有人或持有單位'),
      updateValueOnRadioChange: (event, value) => {
        value.license_owner = event
      },
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("taker")) {
          return true
        } else {
          return false
        }
      }
    },
    // 證照持有單位(廠證)
    license_owned_factory: {
      editable: false,
      type: 'belongsto',
      label: t('持有單位'),
      nameKey: 'name',
      modelName: 'factory',
      serviceIndexKey: 'index',
      parentId: factory && factory.id,
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("license_owned_factory")) {
          return true
        } else {
          return false
        }
      }
    },
    // 證照持有人(需對照後台欄位)
    taker: {
      type: 'belongsto',
      label: t('持有人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("license_owner")) {
          return true
        } else {
          return false
        }
      }
    },
    license_number: {
      type: 'text',
      label: t('證號'),
      placeholder: `${t('輸入')}`,
      rules: 'required'
    },
    setup_license: {
      label: t('本單位報准掛證人員'),
      type: 'belongsto',
      modelName: 'license',
      serviceIndexKey: 'index',
      nameKey: 'name',
      customizedNameKey: 'ApprovalPerson',
      params: {
        lang: 'tw',
        // get_all: 1  // DO NOT SET GETALL
      },
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("setup_license")) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (value.licenseTypeUserLicense && value.licenseTypeUserLicense.id) {
          field.params = {
            ...field.params,
            license_type: value.licenseTypeUserLicense.id
          }
        }
      },
    },
    agents: {
      type: 'belongstomany',
      label: `${t('代理人')}(${t('請選擇具有代理人資格之人員')})`,
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("agent")) {
          return true
        } else {
          return false
        }
      }
    },
    approval_letter: {
      type: 'text',
      label: t('核准函號'),
      placeholder: t('輸入')
    },
    valid_end_date_checkbox: {
      type: 'checkbox',
      label: `${t('永久效期')}`,
      updateValueOnCheckboxChange: ($event, value, fields) => {
        if ($event) {
          delete value.valid_end_date
          delete fields.remind_date_radio.rules
          delete fields.valid_end_date.rules
          const _value = {
            ...value,
            valid_end_date_checkbox: true,
            remind_date_radio: 2
          }
          fields.remind_date.label = t('續辦提醒日期')
          return _value
        }
        else if ($event === false) {
          const _value = {
            ...value,
            valid_end_date_checkbox: false,
            remind_date_radio: 1
          }
          fields.remind_date.label = t('')
          if (value && !value.license_type.name.includes('回訓')) {
            // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1777
            fields.remind_date_radio.rules = 'required'
            fields.valid_end_date.rules = 'required'
          }
          return _value
        }
      },
      displayCheckedOrNot(fieldsValue) {
        if (fieldsValue.valid_end_date_checkbox) {
          return true
        } else {
          return false
        }
      },
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("permanent_validity")) {
          return true
        } else {
          return false
        }
      },
    },
    valid_start_date: {
      type: 'date',
      label: t('有效起日'),
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("valid_start_date")) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (value.license_type.name.includes(t('回訓'))) {
          delete field.rules
        }
      },
    },
    valid_end_date: {
      type: 'date',
      label: t('有效迄日'),
      rules: 'required',
      editableDependOnValue(fieldsValue) {
        if (fieldsValue.valid_end_date_checkbox &&
          fieldsValue.valid_end_date_checkbox == true
        )
          return false
      },
      getMinimumDate: fieldValue => {
        return fieldValue.valid_start_date
      },
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("valid_end_date")) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (value.valid_end_date_checkbox) {
          // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1778
          delete field.rules
        }
        if (value.license_type.name.includes(t('回訓'))) {
          delete field.rules
        }
        if (event && value.statitory_extension_period) {
          const _day = moment(event)
            .add(-value.statitory_extension_period, 'days')
            .format('YYYY-MM-DD')
          fields.remind_date_radio.label = `${t('續辦提醒日期')}(${t('法定展延期限')}${_day})`
        } else if (event && value.recommend_notify_period) {
          const _day = moment(event)
            .add(-value.recommend_notify_period, 'days')
            .format('YYYY-MM-DD')
          fields.remind_date_radio.label = `${t('續辦提醒日期')}(${t('法定展延期限')}${_day})`
        }
        if (event && value.license_type.name.includes('回訓')) {
          fields.remind_date_radio.rules = 'required'
        }
        if (event && value.remind_date_radio === 1) {
          const _day =
            value.statitory_extension_period + value.recommend_notify_period
          return {
            remind_date: moment(event).add(-_day, 'days').format('YYYY-MM-DD')
          }
        }
      }
    },
    statitory_extension_period: {
      type: 'number'
    },
    recommend_notify_period: {
      type: 'number'
    },
    remind_date_radio: {
      defaultValue: 1,
      label: t('續辦提醒日期'),
      type: 'radio',
      items: [
        {
          label: `${t('系統自動設定')}（ ${t('建議法定展延期限前{number}天', { number: 60 })} ）`,
        },
        {
          label: t('自訂提醒日'), value: 2
        }
      ],
      // https://www.notion.so/6eaecd939e8a404b88649eab18ab205a
      rules: 'required',
      updateValueOnChange: (event, value, field, fields) => {
        if (value.valid_end_date_checkbox === false) {
          field.rules = 'required'
        }
        if (value.valid_start_date && value.valid_end_date) {
          field.rules = 'required'
        }
        if (event === 1 && !value.license_type?.name?.includes('其他')) {
          const _valid_end_day = value.valid_end_date
          const _day = value.statitory_extension_period + value.recommend_notify_period
          const _remind_data = moment(_valid_end_day).add(-_day, 'days').format('YYYY-MM-DD')
          fields.remind_date_radio.label = `${t('續辦提醒日期')}（${t('法定展延期限')}${_remind_data}）`
          return {
            remind_date: _remind_data
          }
        } else {
          fields.remind_date_radio.label = `${t('續辦提醒日期')}`
          fields.remind_date.label = ``
          return false
        }
      },
      displayCheck(fieldsValue) {
        if (fieldsValue.valid_end_date_checkbox === false) {
          return true
        } else {
          return false
        }
      },
      customizedItems: (value, field) => {
        // https://www.notion.so/6eaecd939e8a404b88649eab18ab205a
        if (value && value.license_type.name.includes('回訓')) {
          delete field.rules
        }
        if (
          value.statitory_extension_period &&
          value.recommend_notify_period &&
          value.remind_date_radio === 1 &&
          value.valid_end_date // 250602-issue
        ) {
          const _statitory_extension_period = value.statitory_extension_period
          const _recommend_notify_period = value.recommend_notify_period
          return [
            {
              label: `${t('系統自動設定')}（ ${t('建議法定展延期限前{number}天', { number: _recommend_notify_period })} ${value.remind_date ? value.remind_date : ''}）`,
              value: 1,
              style: {
              }
            },
            { label: t('自訂提醒日'), value: 2 }
          ]
        } else if (
          value.recommend_notify_period &&
          value.remind_date_radio === 1 &&
          value.valid_end_date // 250602-issue
        ) {
          const _day = value.recommend_notify_period
          return [
            {
              label: `${t('系統自動設定')}（${t('建議法定展延期限前{number}天', { number: _day })} ${value.remind_date}）`,
              value: 1,
              style: {
              }
            },
            { label: t('自訂提醒日'), value: 2 }
          ]
        } else if (value.recommend_notify_period) {
          const _day = value.recommend_notify_period
          return [
            {
              label: `${t('系統自動設定')}（${t('建議法定展延期限前{number}天', { number: _day })}）`,
              value: 1,
              style: {
                width: width * 0.9,
              }
            },
            { label: t('自訂提醒日'), value: 2 }
          ]
        } else {
          return [{ label: t('自訂提醒日'), value: 2 }]
        }
      }
    },
    remind_date: {
      type: 'date',
      label: t('自訂提醒日'),
      displayCheck(fieldsValue) {
        if (fieldsValue.remind_date_radio === 2) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (value.valid_end_date_checkbox === false) {
          field.rules = 'required'
        }
        if (event) {
          fields.remind_date_radio.label = `${t('續辦提醒日期')}(${t('法定展延期限')}${event})`
        }
      }
    },
    reminder: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    remark: {
      type: 'text',
      label: t('備註'),
      placeholder: `${t('輸入')}`
    },
    file_attaches: {
      modelName: 'license',
      type: 'Ll_filesAndImages',
      label: t('附件'),
      uploadBtnText: t('上傳')
    },
    processing_at: {
      type: 'date',
      label: t('辦理日期'),
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("processing_at")) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (event) {
          let _value
          _value = {
            ...value,
            retraining_at: event
          }
          return _value
        }
      }
    },
    retraining_at: {
      type: 'date',
      label: t('回訓起算日'),
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("retraining_at")) {
          return true
        } else {
          return false
        }
      },
      // minimumDateCompareWithField: 'processing_at',
    },
    retraining_rule: {
      type: 'multi_number',
      label: t('回訓規則'),
      rules: 'multi_required',
      items: [
        {
          type: 'number',
          name: 'years',
          label: t('年'),
        },
        {
          type: 'number',
          name: 'hours',
          label: t('小時'),
        }
      ],
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("retraining_rule")) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (event && event.years && value.retraining_at) {
          const retrainingAtMoment = moment(value.retraining_at);
          if (retrainingAtMoment.isValid()) {
            let _value
            const _defaultDate = retrainingAtMoment.add(event.years, 'years').subtract(6, 'months');
            _value = {
              ...value,
              retraining_rule: {
                years: event.years,
                hours: event.hours,
              },
              retraining_year: event.years,
              retraining_remind_date: _defaultDate
            }
            return _value
          } else {
            console.error('Invalid date format for value.retraining_at:', value.retraining_at);
          }
        }
      }
    },
    retraining_remind_date: {
      type: 'date',
      label: t('回訓提醒日'),
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.license_type &&
          fieldsValue.license_type.show_fields &&
          fieldsValue.license_type.show_fields.length > 0 &&
          fieldsValue.license_type.show_fields.includes("retraining_remind_date")) {
          return true
        } else {
          return false
        }
      }
    },
    minimumDateCompareWithField: 'retraining_at',
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

  const stepSettings = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.license_type &&
          fieldsValue.license_type.show_fields
        ) {
          return [
            'license_type',
            'license_template',
            'name',
            'taker',
            'license_owner',
            'remind_date_radio',
            'valid_end_date_checkbox',
            'image',
            'file_image',
            'file_attaches',
            'remind_date',
            'agents',
            'related_guidelines_articles',
            ...fieldsValue.license_type.show_fields
          ]
        } else {
          return [
            'image',
            'license_status_number',
            'using_status',
            'agents',
            'related_guidelines_articles'
          ]
        }
      }
    }
  ]

  // 新增證照
  const $_submitCreate = async (_postData, navigation) => {
    const _data = S_License.getDataForCreateLicense(_postData, systemClasses)
    const _versionData = S_License.getDataForCreateLicenseVersion(_postData, factory)
    // console.log(JSON.stringify(_versionData), '_versionData');
    const license = await S_License.create({
      parentId: factory && factory.id,
      data: _data
    })
    const licenseId = license.id
    const version = await S_LicenseVersion.create({
      modelId: licenseId,
      parentId: factory && factory.id,
      data: _versionData
    })
    Promise.all([license, version])
      .then(res => {
        Alert.alert(t('新增證照成功'))
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'LicenseIndex'
            },
            {
              name: 'LicenseShow',
              params: {
                id: res[0].id,
                type: res[0].license_type,
                reload: true,
              }
            }
          ],
          key: null
        })
      })
      .catch(reason => {
        Alert.alert(t('新增證照失敗'))
        navigation.navigate({
          name: 'LicenseIndex'
        })
      })
  }

  // 編輯證照
  const $_submitUpdate = async (
    _formattedValue,
    modelId,
    versionId,
    navigation
  ) => {
    try {
      const _licenseData = S_License.getDataForEditLicense(
        _formattedValue,
        factory.id,
        systemClasses
      );
      const _licenseVersionData = S_License.getDataForEditLicenseVersion(_formattedValue);
      console.log(versionId, 'versionId');
      console.log(JSON.stringify(_licenseVersionData), '_licenseVersionData');
      // 並行發送兩個 API 請求
      const [version, license] = await Promise.all([
        S_LicenseVersion.update({
          modelId: versionId,
          data: _licenseVersionData
        }),
        S_License.update({
          modelId: modelId,
          data: _licenseData
        })
      ]);
      console.log(modelId, 'modelId');
      Alert.alert(t('編輯證照成功'));
      navigation.reset({
        index: 1,
        routes: [
          {
            name: 'LicenseIndex'
          },
          {
            name: 'LicenseShow',
            params: {
              id: license.id,
              refreshKey: Date.now()
            }
          }
        ],
        key: null
      });
    } catch (error) {
      console.error(error);
      Alert.alert(t('編輯證照發生異常'));
      navigation.navigate('LicenseIndex');
    }
  };


  // 更新證照版本
  const $_submitUpdateVersion = async (
    _formattedValue,
    modelId,
    versionId,
    navigation
  ) => {
    const postData = S_License.getLicenseDataForUpdateVersion(_formattedValue)
    // console.log(modelId, '=modelId=');
    // console.log(JSON.stringify(postData), 'postData');
    const version = await S_LicenseVersion.create({
      parentId: factory && factory.id,
      modelId: modelId,
      data: postData
    })
    const license = await S_License.update({
      modelId: modelId,
      data: postData
    })
    Promise.all([version, license])
      .then(res => {
        Alert.alert(t('更新證照成功'))
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'LicenseIndex'
            },
            {
              name: 'LicenseShow',
              params: {
                id: res[1].id,
                refreshKey: Date.now()
              }
            }
          ],
          key: null
        })
      })
      .catch(error => {
        console.error(error);
        Alert.alert(t('更新證照失敗'))
        navigation.navigate('LicenseIndex');
      })
  }

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }
      }>
      <StackSetting.Screen
        name="LicenseIndex"
        component={scopeFilterScreen('license-read', ViewLicenseIndex)}
        options={({ navigation }) => ({
          title: t('證照管理'),
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
        name="LicenseShow"
        component={scopeFilterScreen('license-read', ViewLicenseShow)}
        options={({ navigation }) => ({
          title: t('證照'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="IndexWithTemplate"
        component={scopeFilterScreen('license-read', ViewIndexWithTemplate)}
        options={({ navigation }) => ({
          title: t('證照清單'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="IndexWithLicenseType"
        component={scopeFilterScreen(
          'license-read',
          ViewIndexWithLicenseType
        )}
        options={({ navigation }) => ({
          title: t('證照清單'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="LicensePickTypeTemplate"
        component={scopeFilterScreen(
          'license-create',
          ViewLicensePickTypeTemplate
        )}
        options={({ navigation }) => ({
          title: t('新增'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="LicensePickTemplate"
        component={scopeFilterScreen(
          'license-create',
          ViewLicensePickTemplate
        )}
        options={({ navigation }) => ({
          title: t('新增'),
          ...$option.headerOption
        })}
      />
      {/* <StackSetting.Screen
        name="LicenseUpdateVersion"
        component={scopeFilterScreen(
          'LicenseUpdateVersion',
          ViewLicenseUpdateVersion
        )}
        options={({navigation}) => ({
          title: t('更新證照'),
          ...$option.headerOption
        })}
      /> */}
      <StackSetting.Screen
        name="LicenseCreate"
        component={scopeFilterScreen('license-create', WsStepRoutesCreate)}
        options={{
          title: t('新增證照'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'LicenseCreate',
          title: t('新增證照'),
          modelName: 'license',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'LicenseIndex',
          parentId: factory && factory.id,
          versionName: 'license_version',
          submitFunction: $_submitCreate
        }}
      />
      <StackSetting.Screen
        name="LicenseUpdate"
        component={scopeFilterScreen([
          'license-update-creator',
          'license-update-reminder',
          'license-update',
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('編輯證照'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'LicenseUpdate',
          title: t('編輯證照'),
          modelName: 'license',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'LicenseShow',
          parentId: factory && factory.id,
          submitFunction: $_submitUpdate
        }}
      />
      <StackSetting.Screen
        name="LicenseUpdateVersion"
        component={scopeFilterScreen(
          'license-create',
          WsStepRoutesUpdate
        )}
        options={({ navigation }) => ({
          title: t('更新證照版本'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'LicenseUpdate',
          title: t('更新證照版本'),
          modelName: 'license',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'LicenseShow',
          parentId: factory && factory.id,
          submitFunction: $_submitUpdateVersion
        }}
      />
      <StackSetting.Screen
        name="LicenseTemplateShow"
        component={scopeFilterScreen('license-read', ViewLicenseTemplateShow)}
        options={({ navigation }) => ({
          title: t('證照公版'),
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
        name="DashboardLicenseExpiredList"
        component={scopeFilterScreen('license-read', ViewDashboardLicenseExpiredList)}
        options={({ navigation }) => ({
          title: t('證照即將到期'),
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
        name="DashboardLicenseExpired"
        component={scopeFilterScreen('license-read', ViewDashboardLicenseExpired)}
        options={({ navigation }) => ({
          title: t('證照即將到期'),
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

export default RoutesLicense
