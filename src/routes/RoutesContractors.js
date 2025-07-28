import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import ViewContractorsIndex from '@/views/Contractors/Index'
import ViewContractorsShow from '@/views/Contractors/Show'
import ViewContractorsLicenseShow from '@/views/Contractors/ContractorsLicense/Show'
import ViewContractorsLicensePickTypeTemplate from '@/views/Contractors/ContractorsLicense/PickTemplate'
import ViewContractorsContractShow from '@/views/Contractors/ContractorsContract/Show'
import $option from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_Contractor from '@/services/api/v1/contractor'
import S_ContractorLicense from '@/services/api/v1/contractor_license'
import S_ContractorContract from '@/services/api/v1/contract'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class.js'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsSubtaskCard,
  WsText,
  WsContactUserCard,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
const StackSetting = createStackNavigator()
import ViewContractorsLicenseTemplateShow from '@/views/Contractors/Template/ContractorLicenseTemplateShow'

const RoutesContractors = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // REDUX
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // FIELD
  const fields = {
    contractor_status: {
      type: 'radio',
      label: t('合作狀態'),
      items: [
        { label: t('合作中'), value: 1 },
        { label: t('合作終止'), value: 0 }
      ],
      autoFocus: true
    },
    contractor_name: {
      label: t('名稱'),
      rules: 'required',
      placeholder: t('輸入'),
    },
    tax_id: {
      type: 'number',
      label: t('統一編號'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      label: t('領域'),
      placeholder: `${t('選擇')}`,
      rules: 'required'
    },
    contractor_types: {
      type: 'belongstomany',
      label: t('承攬類別'),
      nameKey: 'name',
      valueKey: 'id',
      modelName: 'contractor_type',
      updateValueOnChange(event, value, field, fields) {
        if (event && event.length > 0) {
          delete fields.contractor_customed_types.rules
        }
      }
    },
    contractor_customed_types: {
      type: 'belongstomany',
      label: t('自訂類別'),
      modelName: 'contractor_customized_type',
      nameKey: 'name',
      valueKey: 'id',
      params: {
        get_all: 1,
        order_by: 'sequence',
        order_way: 'asc'
      },
      rules: 'required',
      updateValueOnChange(event, value, field, fields) {
        if (event && event.length > 0) {
          delete fields.contractor_types.rules
        }
      }
    },
    contact: {
      rules: 'at_least',
      type: 'models',
      label: t('聯絡人'),
      fields: {
        name: {
          text: t('新增聯絡人'),
          label: t('新增聯絡人'),
          autoFocus: true,
          placeholder: `${t('輸入')}`,
          rules: 'required'
        },
        email: {
          type: 'email',
          label: t('信箱'),
          placeholder: `${t('輸入')}`,
          rules: 'email'
        },
        tel: {
          type: 'tel',
          label: t('電話'),
          autoFocus: true,
          placeholder: `${t('輸入')}`,
          rules: 'isTelephone'
        },
        mobile: {
          type: 'number',
          label: t('手機'),
          placeholder: `${t('輸入')}`,
          rules: 'isMobilePhone'
        }
      },
      renderCom: WsContactUserCard,
      renderItem: (item, index) => {
        return (
          <WsContactUserCard
            item={item}
            name={item.name}
            email={item.email}
            tel={item.tel}
            mobile={item.mobile}
            onPress={onPress}
          />
        )
      }
    },
    review: {
      type: 'radio',
      label: t('是否為拒絕往來廠商'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ]
    },
    review_remark: {
      label: t('廠商評比')
    },
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    remark: {
      label: t('備註')
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
          fieldsValue.contractors_type &&
          fieldsValue.contractors_type.show_fields
        ) {
          return [
            'contractor_name',
            ...fieldsValue.contractors_type.show_fields
          ]
        } else {
          return [
            'contractor_status',
            'contractor_name',
            'tax_id',
            'system_subclasses',
            'contractor_types',
            'contractor_customed_types',
            'contact',
            'review',
            'review_remark',
            'owner',
            'remark',
            'attaches'
          ]
        }
      }
    }
  ]

  // 建立承攬商
  const $_submitCreateContractor = async (data, navigation) => {
    const _data = {
      ...data,
      name: data.contractor_name,
      contractor_status: 1,
      remark_updated_user: currentUser && currentUser.id ? currentUser.id : null,
      factory: factory && factory.id
    }
    try {
      const result = await S_Contractor.create({
        data: _data
      }).then(res => {
        navigation.navigate({
          name: 'ContractorsShow',
          params: {
            id: res.id
          }
        })
      })
    } catch (e) {
      console.log(e.message, '===create error===')
    }
  }

  // 編輯承攬商
  const $_submitEditContractor = async (
    data,
    modelId,
    VersionId,
    navigation
  ) => {
    const _data = {
      ...data,
      name: data.contractor_name
    }
    try {
      const result = await S_Contractor.update({
        modelId,
        data: _data
      })
    } catch (e) {
      console.error(e.message, '===update error===')
    }
    navigation.navigate({
      name: 'ContractorsShow',
      params: {
        id: modelId
      }
    })
  }

  // 建立與編輯資格證帶入的欄位
  const fieldsForContractorLicense = {
    image: {
      type: 'image',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor_license_version/image` : null,
      text: t('上傳資格證圖片'),
      icon: 'ws-outline-license'
    },
    contractor_license_template: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'contractor_license_template',
      parentId: factory && factory.id,
      onPress: () => {
        navigation.navigate({
          name: 'ContractorsLicenseShow'
        })
      },
      hasMeta: false,
      rules: 'required'
    },
    name: {
      label: t('資格證照名稱'),
      rules: 'required'
    },
    // agent_text: {
    //   type: 'text',
    //   label: t('資格證持有承攬商'),
    //   placeholder: t('請輸入資格證持承攬商'),
    //   editable: false,
    //   rules: 'required',
    // },
    // taker_text: {
    //   type: 'text',
    //   label: t('資格證持有人'),
    //   placeholder: t('請輸入資格證持有人'),
    // },
    license_owner: {
      type: 'switchTextInput',
      label: t('資格證照持有單位'),
      switchTextInputItemLabel: [
        {
          field: 'agent_text',
          label: t('承攬商'),
          value: 1
        },
        {
          field: 'taker_text',
          label: t('人員'),
          value: 2
        }
      ],
      placeholder: t('資格證照持有單位'),
      updateValueOnRadioChange: (event, value) => {
        if (event === 1) {
          return {
            license_owner: {
              agent_text: value.currentContractorBasicData.name
            }
          }
        } else {
          return {
            license_owner: {
              agent_text: null
            }
          }
        }
      }
    },
    license_number: {
      type: 'text',
      label: t('證號'),
      placeholder: t('請輸入證號'),
      rules: 'required'
    },
    approval_letter: {
      type: 'text',
      label: t('核准函號'),
      placeholder: t('輸入')
    },
    valid_start_date: {
      type: 'date',
      label: t('有效起日'),
      getMaximumDate: fieldValue => {
        return fieldValue.valid_end_date
      },
      rules: 'required'
    },
    valid_end_date_checkbox: {
      type: 'checkbox',
      label: t('永久效期'),
      updateValueOnCheckboxChange: ($event, value, fields) => {
        if ($event) {
          delete fields.remind_date_radio.rules
          delete fields.remind_date.rules
          delete fields.valid_end_date.rules
        } else if ($event === false) {
          fields.remind_date_radio.rules = 'required'
          fields.remind_date.rules = 'required'
          fields.valid_end_date.rules = 'required'
        }
      },
      displayCheckedOrNot(fieldsValue) {
        if (
          fieldsValue.valid_end_date_checkbox &&
          !fieldsValue.valid_end_date &&
          !fieldsValue.remind_date
        ) {
          return true
        } else {
          return false
        }
      }
    },
    valid_end_date: {
      type: 'date',
      label: t('有效迄日'),
      getMinimumDate: fieldValue => {
        return fieldValue.valid_start_date
      },
      displayCheck(fieldsValue) {
        if (!fieldsValue.valid_end_date_checkbox) {
          return true
        } else {
          return false
        }
      },
      rules: 'required'
    },
    remind_date_radio: {
      label: t('提醒確認效期更新'),
      rules: 'required',
      type: 'radio',
      items: [
        { label: `${t('系統自動設定')}（${t('建議法定展延期限前{number}天', { number: 1 })}）` },
        { label: t('自訂提醒日'), value: 2 }
      ],
      updateValueOnChange: value => {
        if (value === 1) {
          return { remind_date: moment().add(-10, 'days').format('YYYY-MM-DD') }
        } else {
          return false
        }
      },
      displayCheck(fieldsValue) {
        if (!fieldsValue.valid_end_date_checkbox) {
          return true
        } else {
          return false
        }
      },
      defaultValue: 1,
      rules: 'required'
    },
    remind_date: {
      type: 'date',
      label: t('提醒日'),
      rules: 'required',
      displayCheck(fieldsValue) {
        if (fieldsValue.remind_date_radio === 2) {
          return true
        } else {
          return false
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
      label: t('備註')
    },
    attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor_license_version/attach` : null
    }
  }
  // 建立資格證要帶入的欄位顯示設定
  const stepSettingsForContractorLicense = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.contractor_license_type &&
          fieldsValue.contractor_license__type.show_fields
        ) {
          return [
            'license_template',
            'name',
            'image',
            'license_number',
            'approval_letter',
            'remind_date_radio',
            ...fieldsValue.license_type.show_fields
          ]
        } else {
          return [
            'contractor_license_template',
            'name',
            'image',
            'agent_text',
            'taker_text',
            'license_owner',
            'license_number',
            'approval_letter',
            'valid_start_date',
            'valid_end_date_checkbox',
            'valid_end_date',
            'remind_date_radio',
            'remind_date',
            'reminder',
            'attaches',
            'image'
          ]
        }
      }
    }
  ]

  // 建立承攬商資格證
  const $_submitCreateContractorLicense = async (data, navigation) => {
    const asyncData = await AsyncStorage.getItem(
      'ContractorsLicenseCreate'
    ).then(async asyncData => {
      const _asyncData = JSON.parse(asyncData)
      // 建立承攬商資格證API Step1
      const _contractorData = {
        name: _asyncData.name,
        contractor: _asyncData.currentContractorBasicData.id,
        contractor_license_template: _asyncData.contractor_license_template.id,
        license_template: _asyncData.license_template.id,
        system_classes: _asyncData.system_classes ? S_SystemClass.$_formatDataWithId(_asyncData.system_classes) : '',
        system_subclasses: _asyncData.system_subclasses
          ? S_SystemClass.$_formatDataWithId(_asyncData.system_subclasses)
          : ''
      }
      try {
        const result = await S_ContractorLicense.create({
          factory: factory && factory.id ? factory.id : null,
          data: _contractorData
        }).then(async res => {
          // 建立承攬商資格證API Step2
          const _data = {
            license_number: _asyncData.license_number,
            approval_letter: _asyncData.approval_letter,
            taker_text: _asyncData.taker_text,
            agent_text: _asyncData.agent_text,
            image: _asyncData.image,
            attaches: _asyncData.attaches,
            reminder: _asyncData.reminder.id,
            valid_start_date: _asyncData.valid_start_date,
            valid_end_date: _asyncData.valid_end_date,
            remind_date: _asyncData.remind_date ? _asyncData.remind_date : ''
          }
          try {
            const result = await S_ContractorLicense.createVersion({
              modelId: res.id,
              data: _data
            })
          } catch (e) {
            console.log(e.message, '===update error===')
          }
        })
      } catch (e) {
        console.log(e.message, '===update error===')
      }
      navigation.navigate({
        name: 'ContractorsShow',
        params: {
          id: _asyncData.currentContractorBasicData.id
        }
      })
    })
  }
  // 編輯承攬商資格證
  const $_submitEditContractorLicense = async (
    data,
    modelId,
    versionId,
    navigation
  ) => {
    const _data = {
      taker_text: data.license_owner.taker_text
        ? data.license_owner.taker_text
        : null,
      agent_text: data.license_owner.agent_text
        ? data.license_owner.agent_text
        : null,
      taker: data.taker,
      license_number: data.license_number,
      approval_letter: data.approval_letter,
      valid_start_date: data.valid_start_date,
      valid_end_date: data.valid_end_date,
      reminder: data.reminder,
      image: data.image,
      attaches: data.attaches,
      remind_date: data.remind_date
    }

    const res = await S_ContractorLicense.show({
      modelId: modelId
    })
    const lastLicenseVersionId = res.last_version.id
    const contractorId = res.contractor.id
    const result = await S_ContractorLicense.updateVersion({
      versionId: lastLicenseVersionId,
      data: _data
    }).then(async res => {
      const _data = {
        name: data.name
      }
      const updateContractorLicense = await S_ContractorLicense.update({
        modelId: modelId,
        data: _data
      })
    })
    navigation.navigate({
      name: 'ContractorsShow',
      params: {
        id: contractorId
      }
    })
  }
  // 更新資格證版本
  const $_submitUpdateContractorLicense = async (data, modelId, versionId) => {
    const _data = {
      taker_text: data.taker,
      license_number: data.license_number,
      approval_letter: data.approval_letter,
      valid_start_date: data.valid_start_date,
      valid_end_date: data.valid_end_date,
      reminder: data.reminder,
      image: data.image,
      attaches: data.attaches,
      remind_date: data.remind_date
    }
    try {
      const res = await S_ContractorLicense.createVersion({
        modelId,
        _data
      }).then(async res => {
        const _data = {
          name: data.name
        }
        try {
          const updateContractorLicense = await S_ContractorLicense.update({
            modelId: modelId,
            data: _data
          })
        } catch (e) {
          console.log(e.message, '===update error===')
        }
      })
    } catch (e) {
      console.log(e.message, '===update error===')
    }
  }
  // 更新資格證用的欄位設定
  const fieldsForUpdateContractorLicense = {
    image: {
      type: 'image',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor_license_version/image` : null,
      text: t('上傳資格證圖片'),
      icon: 'ws-outline-license'
    },
    license_template: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'contractor_license_template',
      parentId: factory && factory.id,
      onPress: () => {
        navigation.navigate({
          name: 'ContractorsLicenseShow'
        })
      },
      hasMeta: false,
      editable: false,
      rules: 'required'
    },
    name: {
      label: t('資格證名稱'),
      rules: 'required'
    },
    agent_text: {
      type: 'text',
      label: t('資格證持有承攬商'),
      placeholder: t('請輸入資格證持承攬商'),
      editable: false,
      rules: 'required'
    },
    taker_text: {
      type: 'text',
      label: t('持有人'),
      placeholder: t('輸入')
    },
    license_number: {
      type: 'text',
      label: t('證號'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    approval_letter: {
      type: 'text',
      label: t('核准函號'),
      placeholder: t('輸入')
    },
    valid_start_date: {
      type: 'date',
      label: t('有效起日'),
      getMaximumDate: fieldValue => {
        return fieldValue.valid_end_date
      },
      rules: 'required'
    },
    valid_end_date: {
      type: 'date',
      label: t('有效迄日'),
      getMinimumDate: fieldValue => {
        return fieldValue.valid_start_date
      },
      rules: 'required'
    },
    remind_date: {
      type: 'date',
      label: t('提醒日'),
      rules: 'required'
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
      label: t('備註')
    },
    attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor_license_version/attach` : null
    }
  }
  // 新增與編輯契約帶入的欄位
  const fieldsForContractorContract = {
    name: {
      label: t('契約名稱'),
      rules: 'required'
    },
    contractor: {
      type: 'text',
      editable: false,
      rules: 'required'
    },
    contractor_name: {
      type: 'text',
      label: t('名稱'),
      placeholder: t('輸入'),
      editable: false,
      rules: 'required'
    },
    contractor_licenses: {
      type: 'belongstomany',
      label: t('綁定資格證'),
      nameKey: 'name',
      modelName: 'contractor_license',
      parentId: factory && factory.id,
      rules: 'required',
      customizedParams: value => {
        if (value.contractor) {
          const _params = {
            contractor: value.contractor
          }
          return _params
        }
      }
    },
    valid_start_date: {
      type: 'date',
      label: t('有效起日'),
      getMaximumDate: fieldValue => {
        return fieldValue.valid_end_date
      },
      rules: 'required'
    },
    valid_end_date: {
      type: 'date',
      label: t('有效迄日'),
      getMinimumDate: fieldValue => {
        return fieldValue.valid_start_date
      }
    },
    remind_date: {
      type: 'date',
      label: t('提醒日期'),
      rules: 'required'
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
    confirm_status: {
      type: 'checkbox',
      checkboxLabel: t('我已檢視並確認'),
      checkboxModalText: t('「簽約前提醒事項列表」'),
      checkboxModalInnerTitle: t('「簽約前提醒事項列表」'),
      rules: 'required'
    },
    attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/contractor_license_version/attach` : null
    }
  }
  // 建立契約要帶入的欄位顯示設定
  const stepSettingsForContractorContract = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.contractor_license_type &&
          fieldsValue.contractor_license__type.show_fields
        ) {
          return [
            'license_template',
            'name',
            'image',
            'license_number',
            'approval_letter',
            'remind_date_radio',
            ...fieldsValue.license_type.show_fields
          ]
        } else {
          return [
            'name',
            'contractor_name',
            'contractor_licenses',
            'license_number',
            'approval_letter',
            'valid_start_date',
            'valid_end_date',
            'remind_date',
            'reminder',
            'confirm_status',
            'attaches'
          ]
        }
      }
    }
  ]
  // 建立承攬商契約
  const $_submitCreateContractorContract = async (data, navigation) => {
    const _data = {
      name: data.name,
      contractor: data.contractor,
      contractor_licenses: data.contractor_licenses,
      valid_start_date: data.valid_start_date,
      valid_end_date: data.valid_end_date,
      remind_date: data.remind_date,
      reminder: data.reminder,
      attaches: data.attaches
    }
    const res = await S_ContractorContract.create({
      data: _data,
      factory: factory && factory.id ? factory.id : null
    })
    navigation.navigate({
      name: 'ContractorsShow',
      params: {
        id: data.contractor
      }
    })
  }
  // 編輯承攬商契約
  const $_submitEditContractorContract = async (
    data,
    modelId,
    versionId,
    navigation
  ) => {
    const _data = {
      name: data.name,
      contractor: data.contractor,
      contractor_licenses: data.contractor_licenses,
      valid_start_date: data.valid_start_date,
      valid_end_date: data.valid_end_date,
      remind_date: data.remind_date,
      reminder: data.reminder,
      attaches: data.attaches
    }
    const res = await S_ContractorContract.update({
      contractId: modelId,
      data: _data
    })
    navigation.navigate({
      name: 'ContractorsShow',
      params: {
        id: data.contractor
      }
    })
  }

  return (
    <>
      <StackSetting.Navigator
        screenOptions={{
          headerBackTitleVisible: false
        }}
        initialRouteName="ContractorsIndex">
        <StackSetting.Screen
          name="ContractorsIndex"
          component={scopeFilterScreen('contractor-read', ViewContractorsIndex)}
          options={({ navigation }) => ({
            title: t('承攬商'),
            ...$option.headerOption,
            // headerShown: false,
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
          name="ContractorsShow"
          component={scopeFilterScreen('contractor-read', ViewContractorsShow)}
          options={({ navigation }) => ({
            title: t('承攬商'),
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
          name="ContractorsLicenseShow"
          component={scopeFilterScreen('contractor-license-read', ViewContractorsLicenseShow)}
          options={({ navigation }) => ({
            title: t('承攬商資格證'),
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
          name="ContractorsContractShow"
          component={scopeFilterScreen('contract-read', ViewContractorsContractShow)}
          options={{
            title: t('承攬商契約'),
            ...$option.headerOption
          }}
        />
        <StackSetting.Screen
          name="ContractorCreate"
          component={scopeFilterScreen('contractor-create', WsStepRoutesCreate)}
          options={{
            title: t('建立承攬商'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorCreate',
            title: t('建立承攬商'),
            modelName: 'contractor',
            fields: fields,
            stepSettings: stepSettings,
            afterFinishingTo: 'ContractorsIndex',
            parentId: factory && factory.id,
            submitFunction: $_submitCreateContractor
          }}
        />
        <StackSetting.Screen
          name="ContractorEdit"
          component={scopeFilterScreen([
            'contractor-update-creator',
            'contractor-update-owner',
            'contractor-update',
          ], WsStepRoutesUpdate)}
          options={{
            title: t('編輯承攬商'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorEdit',
            title: t('編輯承攬商'),
            modelName: 'contractor',
            fields: fields,
            stepSettings: stepSettings,
            afterFinishingTo: 'ContractorsShow',
            parentId: factory && factory.id,
            submitFunction: $_submitEditContractor
          }}
        />

        <StackSetting.Screen
          name="ContractorsLicensePickTypeTemplate"
          component={scopeFilterScreen(
            'contractor-create',
            ViewContractorsLicensePickTypeTemplate
          )}
          options={{
            title: t('新增承攬商資格證公版選擇'),
            ...$option.headerOption
          }}
        />
        <StackSetting.Screen
          name="ContractorsLicenseCreate"
          component={scopeFilterScreen(
            'contractor-license-create',
            WsStepRoutesCreate
          )}
          options={{
            title: t('新增承攬商資格證'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorsLicenseCreate',
            title: t('新增承攬商資格證'),
            modelName: 'contractor_license',
            fields: fieldsForContractorLicense,
            stepSettings: stepSettingsForContractorLicense,
            afterFinishingTo: 'ContractorsShow',
            parentId: factory && factory.id,
            submitFunction: $_submitCreateContractorLicense
          }}
        />
        <StackSetting.Screen
          name="ContractorsLicenseEdit"
          component={scopeFilterScreen(
            [
              'contractor-license-update-creator',
              'contractor-license-update-reminder',
              'contractor-license-update',
            ],
            WsStepRoutesUpdate
          )}
          options={{
            title: t('編輯承攬商資格證'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorsLicenseEdit',
            title: t('編輯承攬商資格證'),
            modelName: 'contractor_license',
            fields: fieldsForContractorLicense,
            stepSettings: stepSettingsForContractorLicense,
            afterFinishingTo: 'ContractorsShow',
            parentId: factory && factory.id,
            submitFunction: $_submitEditContractorLicense
          }}
        />

        <StackSetting.Screen
          name="ContractorsLicenseUpdate"
          component={scopeFilterScreen(
            [
              'contractor-license-update-creator',
              'contractor-license-update-reminder',
              'contractor-license-update',
            ],
            WsStepRoutesUpdate
          )}
          options={{
            title: t('更新承攬商資格證'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorsLicenseUpdate',
            title: t('更新承攬商資格證'),
            modelName: 'contractor_license',
            fields: fieldsForUpdateContractorLicense,
            stepSettings: stepSettingsForContractorLicense,
            afterFinishingTo: 'ContractorsShow',
            parentId: factory && factory.id,
            submitFunction: $_submitUpdateContractorLicense
          }}
        />

        <StackSetting.Screen
          name="ContractorsContractCreate"
          component={scopeFilterScreen(
            'contract-create',
            WsStepRoutesCreate
          )}
          options={{
            title: t('新增承攬商契約'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorsContractCreate',
            title: t('新增承攬商契約'),
            modelName: 'contract',
            fields: fieldsForContractorContract,
            stepSettings: stepSettingsForContractorContract,
            afterFinishingTo: 'ContractorsShow',
            parentId: factory && factory.id,
            submitFunction: $_submitCreateContractorContract
          }}
        />

        <StackSetting.Screen
          name="ContractorsContractEdit"
          component={scopeFilterScreen(
            [
              'contract-update-creator',
              'contract-update-owner',
              'contract-update',
            ],
            WsStepRoutesUpdate
          )}
          options={{
            title: t('編輯承攬商契約'),
            headerShown: false,
            ...$option.headerOption
          }}
          initialParams={{
            name: 'ContractorsContractEdit',
            title: t('編輯承攬商契約'),
            modelName: 'contract',
            fields: fieldsForContractorContract,
            stepSettings: stepSettingsForContractorContract,
            afterFinishingTo: 'ContractorsShow',
            parentId: factory && factory.id,
            submitFunction: $_submitEditContractorContract
          }}
        />

        <StackSetting.Screen
          name="ContractorsLicenseTemplateShow"
          component={scopeFilterScreen(
            'contractor-license-read',
            ViewContractorsLicenseTemplateShow
          )}
          options={({ navigation }) => ({
            title: t('資格證公版'),
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

export default RoutesContractors
