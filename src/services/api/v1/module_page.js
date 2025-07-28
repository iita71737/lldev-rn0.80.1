import base from '@/__reactnative_stone/services/wasaapi/v1/__base';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import S_Processor from '@/services/app/processor';
import S_LicenseTemplates from '@/services/api/v1/license_templates'
import store from '@/store';
import moment from 'moment'
import AsyncStorage from '@react-native-community/async-storage'
import S_LicenseType from '@/services/api/v1/license_type'
import S_License from '@/services/api/v1/license'
import S_TrainingTemplate from '@/services/api/v1/internal_training_template'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import S_Training from '@/services/api/v1/training'
import S_EventType from '@/services/api/v1/event_type'
import S_Event from '@/services/api/v1/event'
import S_Task from '@/services/api/v1/task'
import S_GuidelineAdmin from '@/services/api/v1/guideline_admin'
import S_GuidelineVersionAdmin from '@/services/api/v1/guideline_version_admin'
import S_Checklist from '@/services/api/v1/checklist'
import S_AuditRequest from '@/services/api/v1/audit_request'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'module_page',
      params: {
        ...params,
      },
    });
  },
  async findByUrl({ params }) {
    return base.index({
      modelName: `module_page/find/by_value`,
      params: {
        ...params,
      },
    });
  },
  async findAppPage({ params }) {
    if (params.url == null) {
      return
    }
    return base.index({
      modelName: `module_page/find/app_page`,
      params: {
        ...params,
      },
    });
  },
  async redirectByAPIParams(payload, navigation) {
    const state = store.getState()
    const currentFactory = state.data.currentFactory
    const currentUser = state.data.currentUser

    console.log(payload, 'payloadQAQ');

    switch (payload?.route) {

      case 'AuditIndex':
        navigation.push('RoutesAudit', {
          screen: 'AuditIndex',
          params: {
            tabIndex: payload.params?.tabIndex
          }
        })
        return

      case 'AuditShow':
        navigation.push('RoutesAudit', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'AuditTemplateShow':
        navigation.push('RoutesAudit', {
          screen: payload?.route,
          params: {
            id: payload?.params?.id
          }
        })
        return

      case 'AuditAssignmentIntroduction':
        const _res = await S_AuditRequest.show({ modelId: payload?.params?.id, })
        navigation.push('RoutesAudit', {
          screen: 'AuditAssignmentIntroduction',
          params: {
            requestId: payload?.params?.id,
            auditId: _res?.data?.audit_id
          }
        })
        break

      case 'CheckList':
        navigation.push('RoutesCheckList', {
          screen: 'CheckList',
          params: {
            tabIndex: payload?.params?.tabIndex
          }
        })
        return

      case 'CheckListShow':
        navigation.push('RoutesCheckList', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'CheckListAssignmentShow':
        navigation.push('RoutesCheckList', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'CheckListAssignmentIntroductionTemp':
        navigation.push('RoutesCheckList', {
          screen: payload?.route,
          params: {
            id: payload?.modelId,
            linkId: payload?.id
          }
        })
        return

      case 'GeneralScheduleSettingShow':
        const res = await S_Checklist.show({
          modelId: payload?.params?.checklistId,
        })
        navigation.push('RoutesCheckList', {
          screen: payload?.route,
          params: {
            id: payload?.params?.id,
            checklistVersionId: res?.last_version?.id
          }
        })
        return

      case 'CheckListTemplateShow':
        navigation.push('RoutesCheckList', {
          screen: payload?.route,
          params: {
            id: payload?.params?.id
          }
        })
        return

      case 'CheckListAssignmentIntroduction':
        navigation.push('RoutesCheckList', {
          screen: payload?.route,
          params: {
            id: payload?.modelId,
            linkId: payload?.id
          }
        })
        return

      case 'LicenseShow':
        navigation.push('RoutesLicense', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'LicenseIndex':
        navigation.push('RoutesLicense', {
          screen: payload?.route,
          params: {
            tabIndex: payload?.params?.tabIndex
          }
        })
        return

      // 建立證照
      case 'LicenseCreate':
        if (payload?.module_page_value !== 'license-create-other') {
          try {
            let typeList
            const _params1 = {
              order_by: 'sequence',
              order_way: 'asc'
            }
            await S_LicenseType.index({ params: _params1 })
              .then(res => {
                typeList = res.data
              })
            const _params = {
              factory_id: payload?.params?.factory,
              license_template: payload?.params?.license_template_id
            }
            const res = await S_LicenseTemplates.show({
              params: _params
            })
              .then(async _res => {
                // console.log(_res, '_res--');
                const _data = {
                  license_owned_factory: currentFactory,
                  using_status: 1,
                  system_subclasses: _res.system_subclasses,
                  license_template: _res,
                  license_type: _res.license_type,
                  name: _res.name,
                  valid_end_date_checkbox: false,
                  statitory_extension_period: _res.statitory_extension_period
                    ? _res.statitory_extension_period
                    : null,
                  recommend_notify_period: _res.recommend_notify_period
                    ? _res.recommend_notify_period
                    : null,
                  training_hours: _res.training_hours
                    ? _res.training_hours
                    : null,
                  agents: _res.license_type && _res.license_type?.id === 3 ?
                    {
                      id: currentUser.id,
                      name: currentUser.name,
                      avatar: currentUser.avatar
                    } : null,
                  // 報准人員類型需設定的「設定本廠報准掛證人員」
                  licenseTypeUserLicense: typeList && typeList[0] ? typeList[0] : undefined,
                }
                // 續辦提醒設定日期
                const _valid_end_day = _data.valid_end_date
                const _day = _data.statitory_extension_period + _data.recommend_notify_period
                const _remind_data = moment(_valid_end_day).add(-_day, 'days').format('YYYY-MM-DD')
                _data.remind_date = _remind_data
                _data.remind_date_radio = 1
                // console.log(_data, '_data---');
                const _value = JSON.stringify(_data)
                await AsyncStorage.setItem('LicenseCreate', _value)
                navigation.navigate('RoutesLicense', {
                  screen: 'LicenseCreate', // ⬅️ 實際要導向的子畫面
                  params: {
                  }
                })
              })
          } catch (error) {
            console.log(error)
          }
        }
        else if (payload?.module_page_value === 'license-create-other') {
          console.log('QQQQQQQ');
          const licenseType = await S_LicenseType.show({ modelId: payload?.params?.license_type_id })
          const _data = {
            license_owned_factory: currentFactory,
            using_status: 1,
            license_type: licenseType,
            name: licenseType ? licenseType.name : '其他',
            // 有效迄日的顯示與否
            valid_end_date_checkbox: false,
          }
          const _value = JSON.stringify(_data)
          await AsyncStorage.setItem('LicenseCreate', _value)
          navigation.navigate('RoutesLicense', {
            screen: 'LicenseCreate',
            params: {
            }
          })
        }

        return

      // 編輯證照
      case 'LicenseUpdate':
        try {
          const id = payload?.modelId
          const license = await S_License.show({ modelId: id })
          // 移除object中的值為null的欄位
          const _copy_last_version = { ...license.last_version }
          Object.keys(_copy_last_version).forEach(key => {
            if (_copy_last_version[key] === null) {
              delete _copy_last_version[key]
            }
          })
          // 設定初始化valid_end_date_checkbox狀態
          let _checkbox = false
          if (!_copy_last_version.valid_end_date &&
            _copy_last_version.license_type?.name?.includes(t('回訓'))) {
            // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1778
            _checkbox = true
          }
          // 設定來自後台的法定展延期限天數
          let recommend_notify_period
          let statitory_extension_period
          const _license_template = { ...license.license_template }
          recommend_notify_period = _license_template.last_version?.recommend_notify_period
          statitory_extension_period = _license_template.last_version?.statitory_extension_period
          let _license = {
            ...license,
            ..._copy_last_version,
            id: license.id,
            versionId: _copy_last_version.id,
            statitory_extension_period: statitory_extension_period ? statitory_extension_period : undefined,
            recommend_notify_period: recommend_notify_period ? recommend_notify_period : undefined,
            valid_end_date_checkbox: _checkbox,
            // 來自後台的證照類型顯示欄位(廠證)
            license_owned_factory: currentFactory,
            // 關聯內規-顯示用（我綁他人）
            related_guidelines_articles: [],
          }
          // 類型為其他的證照
          if (license.license_type &&
            license.license_type.name &&
            license.license_type.name === '其他'
          ) {
            _license.license_owner = license.taker ? license.taker : currentFactory
          }
          // 回訓欄位格式化
          if (license.last_version &&
            (license.last_version.retraining_year || license.last_version.retraining_hour)) {
            _license.retraining_rule = {
              years: license.last_version.retraining_year ? license.last_version.retraining_year : 0,
              hours: license.last_version.retraining_hour ? license.last_version.retraining_hour : 0
            }
          }
          // 續辦提醒設定日期
          if (_license.remind_date) {
            _license.remind_date_radio = 2
          } else {
            _license.remind_date_radio = 1
          }
          // 關聯內規-顯示
          _license?.related_guidelines?.forEach(item => {
            if (item.guideline_article_version) {
              // 綁特定版本條文
              _license.related_guidelines_articles.push({
                ...item.guideline_article_version,
                guideline_id: item?.guideline?.id,
                guideline_version_id: item?.guideline_version?.id,
                guideline_article: item?.guideline_article,
                guideline_article_version_id: item?.guideline_article_version?.id,
                bind_version: 'specific_ver',
                bind_type: 'specific_layer_or_article'
              })
            }
            else if (item.guideline_article) {
              // 綁最新版本條文
              _license.related_guidelines_articles.push({
                ...item.guideline_article.last_version,
                guideline_id: item?.guideline?.id ? item?.guideline?.id : item.guideline_id ? item.guideline_id : undefined,
                guideline_version_id: item?.guideline_version?.id,
                guideline_article: {
                  ...item?.guideline_article?.last_version,
                  id: item?.guideline_article?.id
                },
                bind_version: 'last_ver',
                bind_type: 'specific_layer_or_article'
              })
            }
            else if (item.guideline_version) {
              // 綁特定版本整部內規
              _license.related_guidelines_articles.push({
                ...item.guideline_version,
                guideline_id: item?.guideline?.id,
                guideline_version: item?.guideline_version,
                bind_version: 'specific_ver',
                bind_type: 'whole_guideline'
              })
            }
            else if (item.guideline) {
              // 綁最新版本整部內規
              _license.related_guidelines_articles.push({
                ...item.guideline,
                guideline_id: item?.guideline?.id,
                bind_version: 'last_ver',
                bind_type: 'whole_guideline'
              })
            }
          });
          // console.log(JSON.stringify(_license), '_license---');
          const _value = JSON.stringify(_license)
          await AsyncStorage.setItem('LicenseUpdate', _value)
          navigation.navigate('RoutesLicense', {
            screen: 'LicenseUpdate', // ⬅️ 實際要導向的子畫面
            params: {
              id: license?.id,
              versionId: license ? license?.last_version?.id : ''
            }
          })
        } catch (e) {
          console.error(e);
        }
        return

      // 更版證照
      case 'LicenseUpdateVersion':
        try {
          const id = payload?.modelId
          const license = await S_License.show({ modelId: id })
          // 移除object中的值為null的欄位
          const _copy_last_version = { ...license.last_version }
          Object.keys(_copy_last_version).forEach(key => {
            if (_copy_last_version[key] === null) {
              delete _copy_last_version[key]
            }
          })
          // 設定初始化valid_end_date_checkbox狀態
          let _checkbox = false
          if (!_copy_last_version.valid_end_date &&
            _copy_last_version.license_type?.name?.includes(t('回訓'))) {
            // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1778
            _checkbox = true
          }
          // 設定來自後台的法定展延期限天數
          let recommend_notify_period
          let statitory_extension_period
          const _license_template = { ...license.license_template }
          recommend_notify_period = _license_template.last_version?.recommend_notify_period
          statitory_extension_period = _license_template.last_version?.statitory_extension_period
          let _license = {
            ...license,
            ..._copy_last_version,
            id: license.id,
            versionId: _copy_last_version.id,
            statitory_extension_period: statitory_extension_period ? statitory_extension_period : undefined,
            recommend_notify_period: recommend_notify_period ? recommend_notify_period : undefined,
            valid_end_date_checkbox: _checkbox,
            // 來自後台的證照類型顯示欄位(廠證)
            license_owned_factory: currentFactory,
            // 關聯內規-顯示用（我綁他人）
            related_guidelines_articles: [],
          }
          // 類型為其他的證照
          if (license.license_type &&
            license.license_type.name &&
            license.license_type.name === '其他'
          ) {
            _license.license_owner = license.taker ? license.taker : currentFactory
          }
          // 回訓欄位格式化
          if (license.last_version &&
            (license.last_version.retraining_year || license.last_version.retraining_hour)) {
            _license.retraining_rule = {
              years: license.last_version.retraining_year ? license.last_version.retraining_year : 0,
              hours: license.last_version.retraining_hour ? license.last_version.retraining_hour : 0
            }
          }
          // 續辦提醒設定日期
          if (_license.remind_date) {
            _license.remind_date_radio = 2
          } else {
            _license.remind_date_radio = 1
          }
          // 關聯內規-顯示
          _license?.related_guidelines?.forEach(item => {
            if (item.guideline_article_version) {
              // 綁特定版本條文
              _license.related_guidelines_articles.push({
                ...item.guideline_article_version,
                guideline_id: item?.guideline?.id,
                guideline_version_id: item?.guideline_version?.id,
                guideline_article: item?.guideline_article,
                guideline_article_version_id: item?.guideline_article_version?.id,
                bind_version: 'specific_ver',
                bind_type: 'specific_layer_or_article'
              })
            }
            else if (item.guideline_article) {
              // 綁最新版本條文
              _license.related_guidelines_articles.push({
                ...item.guideline_article.last_version,
                guideline_id: item?.guideline?.id ? item?.guideline?.id : item.guideline_id ? item.guideline_id : undefined,
                guideline_version_id: item?.guideline_version?.id,
                guideline_article: {
                  ...item?.guideline_article?.last_version,
                  id: item?.guideline_article?.id
                },
                bind_version: 'last_ver',
                bind_type: 'specific_layer_or_article'
              })
            }
            else if (item.guideline_version) {
              // 綁特定版本整部內規
              _license.related_guidelines_articles.push({
                ...item.guideline_version,
                guideline_id: item?.guideline?.id,
                guideline_version: item?.guideline_version,
                bind_version: 'specific_ver',
                bind_type: 'whole_guideline'
              })
            }
            else if (item.guideline) {
              // 綁最新版本整部內規
              _license.related_guidelines_articles.push({
                ...item.guideline,
                guideline_id: item?.guideline?.id,
                bind_version: 'last_ver',
                bind_type: 'whole_guideline'
              })
            }
          });
          // console.log(JSON.stringify(_license), '_license---');
          const _value = JSON.stringify(_license)
          await AsyncStorage.setItem('LicenseUpdate', _value)
          navigation.navigate('RoutesLicense', {
            screen: 'LicenseUpdateVersion', // ⬅️ 實際要導向的子畫面
            params: {
              id: license?.id,
              versionId: license ? license?.last_version?.id : ''
            }
          })
        } catch (e) {
          console.error(e);
        }
        return

      case 'LicenseTemplateShow':
        console.log('LicenseTemplateShow');
        navigation.push('RoutesLicense', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'IndexWithTemplate':
        navigation.push('RoutesLicense', {
          screen: 'IndexWithTemplate',
          params: {
            id: payload?.params?.id
          }
        })
        return

      case 'TrainingIndex':
        navigation.push('RoutesTraining', {
          screen: payload?.route,
          params: {
            tabIndex: payload?.params?.tabIndex
          }
        })
        return

      case 'TrainingShow':
        navigation.push('RoutesTraining', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'TrainingGroupShow':
        navigation.push('RoutesTraining', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'TrainingCreate':
        try {
          let template
          const _modelId = payload?.params?.template_id
          const res = await S_TrainingTemplate.show({
            modelId: _modelId
          })
            .then(async _res => {
              template = _res
              await AsyncStorage.setItem(
                'TrainingCreate',
                JSON.stringify({
                  name: template.name,
                  internal_training_template: template,
                  internal_training_template_version: template.last_version,
                  system_classes:
                    S_SystemClass.getSystemClassesObjectWithSystemSubclasses(
                      template.system_subclasses
                    ),
                  system_subclasses: template.system_subclasses
                })
              )
              navigation.navigate('RoutesTraining', {
                screen: 'TrainingCreate', // ⬅️ 實際要導向的子畫面
                params: {
                }
              })
            })
        } catch (error) {
          console.error(error)
        }
        return

      case 'TrainingUpdate':
        try {
          const _modelId = payload?.modelId
          await S_Training.show({ modelId: _modelId })
            .then(async _res => {
              let _formatForEdit = {
                ..._res,
                // 關聯內規（我綁他人）
                related_guidelines_articles: [],
              }
              // 關聯內規（我綁他人）
              _res?.related_guidelines?.forEach(item => {
                if (item.guideline_article_version) {
                  // 綁特定版本條文
                  _formatForEdit.related_guidelines_articles.push({
                    ...item.guideline_article_version,
                    guideline_id: item?.guideline?.id,
                    guideline_version_id: item?.guideline_version?.id,
                    guideline_article: item?.guideline_article,
                    guideline_article_version_id: item?.guideline_article_version?.id,
                    bind_version: 'specific_ver',
                    bind_type: 'specific_layer_or_article'
                  })
                }
                else if (item.guideline_article) {
                  // 綁最新版本條文
                  _formatForEdit.related_guidelines_articles.push({
                    ...item.guideline_article.last_version,
                    guideline_id: item?.guideline?.id,
                    guideline_version_id: item?.guideline_version?.id,
                    guideline_article: {
                      ...item?.guideline_article?.last_version,
                      id: item?.guideline_article?.id
                    },
                    bind_version: 'last_ver',
                    bind_type: 'specific_layer_or_article'
                  })
                }
                else if (item.guideline_version) {
                  // 綁特定版本整部內規
                  _formatForEdit.related_guidelines_articles.push({
                    ...item.guideline_version,
                    guideline_id: item?.guideline?.id,
                    guideline_version: item?.guideline_version,
                    bind_version: 'specific_ver',
                    bind_type: 'whole_guideline'
                  })
                }
                else if (item.guideline) {
                  // 綁最新版本整部內規
                  _formatForEdit.related_guidelines_articles.push({
                    ...item.guideline,
                    guideline_id: item?.guideline?.id,
                    bind_version: 'last_ver',
                    bind_type: 'whole_guideline'
                  })
                }
              });
              const _value = JSON.stringify(_formatForEdit)
              await AsyncStorage.setItem('TrainingUpdate', _value)
              navigation.navigate('RoutesTraining', {
                screen: 'TrainingUpdate', // ⬅️ 實際要導向的子畫面
                params: {
                  id: _modelId
                }
              })
            })
        } catch (error) {
          console.error(error)
        }
        return

      case 'TrainingTemplateShow':
        navigation.push('RoutesTraining', {
          screen: payload?.route,
          params: {
            id: payload?.params?.id
          }
        })
        return

      case 'EventIndex':
        navigation.push('RoutesEvent', {
          screen: payload?.route,
          params: {
          }
        })
        return

      case 'EventShow':
        navigation.push('RoutesEvent', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'EventCreate':
        try {
          let event_type
          const _modelId = payload?.params?.event_type_id
          const res = await S_EventType.show({
            modelId: _modelId
          })
            .then(async _res => {
              console.log(_res, '_res--');
              event_type = _res
              await AsyncStorage.setItem(
                'EventCreate',
                JSON.stringify({
                  event_status: 1,
                  event_type: event_type,
                  name: event_type.name,
                  owner: currentUser
                })
              )
              navigation.navigate('RoutesEvent', {
                screen: 'EventCreate', // ⬅️ 實際要導向的子畫面
                params: {
                }
              })
            })
        } catch (error) {
          console.error(error)
        }
        return

      case 'EventUpdate':
        try {
          const _modelId = payload?.modelId
          await S_Event.show({ modelId: _modelId })
            .then(async _res => {
              const _event = {
                ..._res,
                occur_at: new Date(moment(_res?.occur_at)),
                improvement_limited_period: new Date(
                  moment(_res.improvement_limited_period)
                )
              }
              await AsyncStorage.setItem('EventUpdate', JSON.stringify(_event))
              navigation.navigate('RoutesEvent', {
                screen: 'EventUpdate', // ⬅️ 實際要導向的子畫面
                params: {
                  id: _modelId
                }
              })
            })
        } catch (error) {
          console.error(error)
        }
        return

      case 'ContractorsIndex':
        navigation.push('RoutesContractors', {
          screen: payload?.route,
          params: {
            tabIndex: payload?.params?.tabIndex
          }
        })
        return

      case 'ContractorsShow':
        navigation.push('RoutesContractors', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'ContractorsLicenseShow':
        navigation.push('RoutesContractors', {
          screen: payload?.route,
          params: {
            id: payload?.params?.licenseId,
          }
        })
        return

      case 'ContractorsLicenseTemplateShow':
        navigation.push('RoutesContractors', {
          screen: payload?.route,
          params: {
            id: payload?.params?.id,
          }
        })
        return

      case 'ContractorsContractShow':
        navigation.push('RoutesContractors', {
          screen: payload?.route,
          params: {
            id: payload?.params?.contract_id,
          }
        })
        return

      case 'ContractorEnterShow':
        navigation.push('RoutesContractorEnter', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'ContractorEnter':
        navigation.push('RoutesContractorEnter', {
          screen: payload?.route,
          params: {
          }
        })
        return

      case 'ExitChecklistShow':
        navigation.push('RoutesContractorEnter', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'TaskShow':
        navigation.push('RoutesTask', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'TaskUpdate':
        try {
          const id = payload?.modelId
          const res = await S_Task.show({ modelId: id });
          const _formatted = S_Task.transformTaskLinksToRelatedModules(res)
          const _task = JSON.stringify(_formatted)
          await AsyncStorage.setItem('TaskUpdate', _task)
          navigation.push('RoutesTask', {
            screen: payload?.route,
            params: {
              id: payload?.modelId
            }
          })
        } catch (e) {
          return e
        }
        return

      case 'TaskCreate':
        navigation.push('RoutesTask', {
          screen: 'TaskCreate'
        })
        return

      case 'AlertShow':
        navigation.push('RoutesAlert', {
          screen: payload?.route,
          params: {
            id: payload?.modelId
          }
        })
        return

      case 'FileStore':
        navigation.push('FileStore')
        return

      case 'FileStoreShow':
        navigation.push('FileStoreShow', {
          id: payload?.params?.file_id
        })
        return

      case 'FileStoreSubLayer':
        navigation.push('FileStoreSubLayer', {
          file_folder: payload?.params?.file_folder_id,
        })
        return

      // 概況
      case 'DashboardFactory':
        navigation.navigate('DashboardFactory')
        return

      // 看板
      case 'My':
        navigation.navigate('MyIndex')
        return

      case 'AlertIndex':
        navigation.navigate('RoutesAlert', {
          screen: 'AlertIndex', // ⬅️ 實際要導向的子畫面
          params: {
            tabIndex: payload?.module_page_value === 'notifications' ? 0 : 1
          }
        })
        return

      case 'ActIndex':
        navigation.navigate('RoutesAct', {
          screen: 'Act',
          params: {
          }
        })
        return

      case 'TaskIndex':
        navigation.navigate('RoutesTask', {
          screen: 'TaskIndex',
          params: {
          }
        })
        return

      case 'Menu':
        navigation.navigate('RoutesMenu', {
          screen: 'Menu', // ⬅️ 實際要導向的子畫面
          params: {
          }
        })
        return

      case 'GuidelineIndex':
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineIndex', // ⬅️ 實際要導向的子畫面
          params: {
            tabIndex: payload?.params?.tabIndex
          }
        })
        return

      case 'GuidelineShow':
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineShow', // ⬅️ 實際要導向的子畫面
          params: {
            id: payload?.params?.id
          }
        })
        return

      case 'GuidelineAdminIndex':
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineAdminIndex', // ⬅️ 實際要導向的子畫面
          params: {
          }
        })
        return

      case 'GuidelineAdminShow':
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineAdminShow', // ⬅️ 實際要導向的子畫面
          params: {
            id: payload?.params?.id
          }
        })
        return

      case 'GuidelineAdminUpdate':
        try {
          const _res = await S_GuidelineAdmin.show({ modelId: payload?.params?.id })
          const _data = {
            ..._res.last_version,
            ..._res,
          }
          const _formatted = S_GuidelineAdmin.formattedBeforeEdit(_data)
          const _value = JSON.stringify(_formatted)
          await AsyncStorage.setItem('GuidelineAdminUpdate', _value)
          navigation.navigate('RoutesAct', {
            screen: 'GuidelineAdminUpdate',
            params: {
              id: payload?.params?.id,
              versionId: _res?.last_version?.id
            }
          })
        } catch (e) {
          console.log(e.message, 'error')
        }
        return

      case 'GuidelineAdminUpdateVersion':
        try {
          const _res = await S_GuidelineAdmin.show({ modelId: payload?.params?.id })
          const _data = {
            ..._res.last_version,
            ..._res,
            guideline: payload?.params?.id
          }
          const _formatted = S_GuidelineVersionAdmin.formattedDataForRouteToGuidelineAdminUpdateVersion(_data)
          const _value = JSON.stringify(_formatted)
          await AsyncStorage.setItem('GuidelineAdminUpdateVersion', _value)
          navigation.push('RoutesAct', {
            screen: 'GuidelineAdminUpdateVersion',
            params: {
              id: payload?.params?.id
            }
          })
        } catch (e) {
          console.log(e.message, 'error')
        }
        return

      case 'GuidelineAdminCreate':
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineAdminCreate',
          params: {
          }
        })
        return

      case 'SettingIndex':
        navigation.navigate('RoutesSetting', { screen: 'SettingIndex' })
        return

      case 'ActShow':
        navigation.push('RoutesAct', {
          screen: 'ActShow',
          params: {
            id: payload?.params?.id,
          }
        })
        return

      case 'ActChangeReportShow':
        navigation.push('RoutesAct', {
          screen: 'ActChangeReportShow',
          params: {
            id: payload?.params?.id,
          }
        })
        return

      case 'ChangeIndex':
        navigation.push('RoutesChange', {
          screen: 'ChangeIndex',
          params: {
          }
        })
        return

      case 'ChangeShow':
        navigation.push('RoutesChange', {
          screen: 'ChangeShow',
          params: {
            id: payload?.params?.id,
          }
        })
        return

      case 'ChangeAssignmentIntroduction':
        navigation.push('RoutesChange', {
          screen: 'ChangeAssignmentIntroduction',
          params: {
            id: payload?.params?.id,
          }
        })
        return

      case 'ChangeAssignmentResult':
        navigation.push('RoutesChange', {
          screen: 'ChangeAssignmentResult',
          params: {
            // name: item.name,
            // changeVersionId: item.change_version.id,
            // system_subclass: item.system_subclass,
            changeId: payload?.params?.id,
          }
        })
        return

      case 'ViewBroadCast':
        navigation.push('RoutesApp', {
          screen: 'ViewBroadCast',
          params: {
          }
        })
        return

      case 'BroadCastShow':
        navigation.push('RoutesApp', {
          screen: 'BroadCastShow',
          params: {
            id: payload?.params?.id,
          }
        })
        return

      case 'FactoryDashboardIndex':
        navigation.push('RoutesOrganization', {
          screen: 'FactoryDashboardIndex',
          params: {
          }
        })
        return

      case 'FactoryDashboardShow':
        navigation.push('RoutesOrganization', {
          screen: 'FactoryDashboardShow',
          params: {
          }
        })
        return

      case '404':
        return '404'

      default:
        return '404'

    }
  }
}