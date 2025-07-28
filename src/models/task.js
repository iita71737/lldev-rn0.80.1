import {
  Alert
} from 'react-native';
import moment from 'moment'
import store from '@/store'
import i18next from 'i18next'
import {
  WsSubtaskCard
} from '@/components'
import S_Task from '@/services/api/v1/task'
import AsyncStorage from '@react-native-community/async-storage'

export default {
  getFactoryId() {
    const state = store.getState()
    return state.data.currentFactory.id
  },
  fieldsTask() {
    const _factoryId = this.getFactoryId()
    return {
      name: {
        label: i18next.t('主旨'),
        placeholder: `${i18next.t('輸入')}`,
        rules: 'required'
      },
      system_subclasses: {
        type: 'modelsSystemClass',
        label: i18next.t('領域'),
        placeholder: `${i18next.t('選擇')}`,
        rules: 'required'
      },
      remark: {
        type: 'text',
        label: i18next.t('說明'),
        placeholder: `${i18next.t('輸入')}`,
        rules: 'required'
      },
      taker: {
        type: 'belongsto',
        label: i18next.t('負責人'),
        placeholder: `${i18next.t('選擇')}`,
        nameKey: 'name',
        modelName: 'user',
        rules: 'required',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
      },
      expired_at: {
        type: 'date',
        placeholder: i18next.t('YYYY-MM-DD'),
        label: i18next.t('期限'),
        rules: 'required',
        getMinimumDate: () => {
          return moment().format('YYYY-MM-DD')
        }
      },
      sub_tasks: {
        rules: 'at_least',
        type: 'models',
        fields: {
          name: {
            text: i18next.t('新增'),
            label: i18next.t('主旨'),
            autoFocus: true,
            rules: 'required'
          },
          remark: {
            label: i18next.t('待辦事項說明'),
            rules: 'required'
          },
          taker: {
            type: 'belongsto',
            label: `${i18next.t('待辦事項')}${i18next.t('執行人員')}`,
            nameKey: 'name',
            valueKey: 'id',
            modelName: 'user',
            serviceIndexKey: 'simplifyFactoryIndex',
            customizedNameKey: 'userAndEmail',
            rules: 'required'
          },
          expired_at: {
            type: 'date',
            label: `${i18next.t('期限')}`,
            rules: 'requiredAndCompare'
          },
          attaches: {
            label: `${i18next.t('待辦事項')}${i18next.t('附件')}`,
            type: 'filesAndImages',
            uploadUrl: _factoryId ? `factory/${_factoryId}/sub_task/attach` : null
          }
        },
        renderCom: WsSubtaskCard,
        renderItem: ({ item, itemIndex }) => {
          return (
            <WsSubtaskCard
              name={item.name}
              modalItem={item.name}
              fields={fields.sub_tasks.fields}
              value={item}
            />
          )
        }
      },
      apiAlert: {
        type: 'card',
        cardType: 'alert',
        info: true,
        label: i18next.t('相關警示'),
        displayCheck(fieldsValue) {
          if (fieldsValue.apiAlert) {
            return true
          } else {
            return false
          }
        }
      },
      ll_broadcast: {
        type: 'card',
        cardType: 'broadcast',
        info: true,
        label: i18next.t('相關快報'),
        displayCheck(fieldsValue) {
          if (fieldsValue.ll_broadcast) {
            return true
          } else {
            return false
          }
        }
      },
      relationEvent: {
        type: 'card',
        cardType: 'relativeEvent',
        info: true,
        label: i18next.t('相關事件'),
        displayCheck(fieldsValue) {
          if (fieldsValue.relationEvent) {
            return true
          } else {
            return false
          }
        }
      },
      article_version: {
        type: 'card',
        cardType: 'relativeArticle',
        info: true,
        label: i18next.t('相關法條'),
        displayCheck(fieldsValue) {
          if (fieldsValue.article_version) {
            return true
          } else {
            return false
          }
        }
      }
    }
  },
  fieldsForEditTask() {
    const _factoryId = this.getFactoryId()
    return {
      name: {
        label: i18next.t('主旨'),
        rules: 'required'
      },
      system_subclasses: {
        type: 'modelsSystemClass',
        placeholder: i18next.t('選擇'),
        label: i18next.t('領域'),
        rules: 'required'
      },
      remark: {
        type: 'text',
        label: i18next.t('說明'),
        placeholder: i18next.t('輸入'),
        rules: 'required'
      },
      taker: {
        type: 'belongsto',
        label: i18next.t('負責人'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
        rules: 'required'
      },
      expired_at: {
        type: 'date',
        label: i18next.t('期限'),
        rules: 'required'
      },
      sub_tasks: {
        rules: 'at_least',
        type: 'models',
        fields: {
          id: {
            displayCheck(fieldsValue) {
              return false
            }
          },
          name: {
            text: i18next.t('新增'),
            label: i18next.t('主旨'),
            autoFocus: true,
            rules: 'required'
          },
          remark: {
            label: i18next.t('待辦事項說明'),
            rules: 'required'
          },
          taker: {
            type: 'belongsto',
            label: i18next.t('執行人員'),
            nameKey: 'name',
            valueKey: 'id',
            modelName: 'user',
            serviceIndexKey: 'simplifyFactoryIndex',
            customizedNameKey: 'userAndEmail',
          },
          expired_at: {
            type: 'date',
            label: i18next.t('期限'),
            rules: 'requiredAndCompare'
          },
          attaches: {
            label: i18next.t('附件'),
            type: 'filesAndImages',
            uploadUrl: _factoryId ? `factory/${_factoryId}/sub_task/attach` : null,
          }
        },
        renderCom: WsSubtaskCard,
        renderItem: ({ item, itemIndex }) => {
          return (
            <WsSubtaskCard
              name={item.name}
              modalItem={item.name}
              fields={fields.sub_tasks.fields}
              value={item}
            />
          )
        }
      },
      apiAlert: {
        type: 'card',
        cardType: 'alert',
        info: true,
        label: i18next.t('相關警示'),
        displayCheck(fieldsValue) {
          if (fieldsValue.apiAlert) {
            return true
          } else {
            return false
          }
        }
      },
      ll_broadcast: {
        type: 'card',
        cardType: 'broadcast',
        info: true,
        label: i18next.t('相關快報'),
        displayCheck(fieldsValue) {
          if (fieldsValue.ll_broadcast) {
            return true
          } else {
            return false
          }
        }
      },
      relationEvent: {
        type: 'card',
        cardType: 'relativeEvent',
        info: true,
        label: i18next.t('相關事件'),
        displayCheck(fieldsValue) {
          if (fieldsValue.relationEvent) {
            return true
          } else {
            return false
          }
        }
      },
      article_version: {
        type: 'card',
        cardType: 'relativeArticle',
        info: true,
        label: i18next.t('相關法條'),
        displayCheck(fieldsValue) {
          if (fieldsValue.article_version) {
            return true
          } else {
            return false
          }
        }
      }
    }
  },
  fieldsCreateFromAlert() {
    const _factoryId = this.getFactoryId()
    return {
      name: {
        label: i18next.t('主旨'),
        placeholder: i18next.t('輸入'),
        rules: 'required'
      },
      system_subclasses: {
        type: 'modelsSystemClass',
        label: i18next.t('領域'),
        placeholder: i18next.t('選擇'),
        rules: 'required',
        disabled: true
      },
      remark: {
        type: 'text',
        label: i18next.t('說明'),
        placeholder: i18next.t('輸入'),
        rules: 'required'
      },
      taker: {
        type: 'belongsto',
        label: i18next.t('負責人'),
        placeholder: i18next.t('選擇'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
        rules: 'required'
      },
      expired_at: {
        type: 'date',
        placeholder: i18next.t('YYYY-MM-DD'),
        label: i18next.t('期限'),
        rules: 'required',
        getMinimumDate: () => {
          return moment().format('YYYY-MM-DD')
        }
      },
      sub_tasks: {
        rules: 'at_least',
        type: 'models',
        fields: {
          name: {
            text: i18next.t('新增'),
            label: i18next.t('主旨'),
            autoFocus: true,
            rules: 'required'
          },
          remark: {
            label: i18next.t('待辦事項說明'),
            rules: 'required'
          },
          taker: {
            type: 'belongsto',
            label: i18next.t('執行人員'),
            nameKey: 'name',
            valueKey: 'id',
            modelName: 'user',
            serviceIndexKey: 'simplifyFactoryIndex',
            customizedNameKey: 'userAndEmail',
            rules: 'required'
          },
          expired_at: {
            type: 'date',
            label: i18next.t('期限'),
            rules: 'requiredAndCompare'
          },
          attaches: {
            label: i18next.t('附件'),
            type: 'filesAndImages',
            uploadUrl: _factoryId ? `factory/${_factoryId}/sub_task/attach` : null
          }
        },
        renderCom: WsSubtaskCard,
        renderItem: ({ item, itemIndex }) => {
          return (
            <WsSubtaskCard
              name={item.name}
              modalItem={item.name}
              fields={fields.sub_tasks.fields}
              value={item}
            />
          )
        },
      },
      apiAlert: {
        type: 'card',
        cardType: 'alert',
        info: true,
        label: i18next.t('相關警示') ? i18next.t('相關警示') : ('相關警示'),
        displayCheck(fieldsValue) {
          if (fieldsValue.apiAlert) {
            return true
          } else {
            return false
          }
        }
      },
      ll_broadcast: {
        type: 'card',
        cardType: 'broadcast',
        info: true,
        label: i18next.t('相關快報') ? i18next.t('相關快報') : ('相關快報'),
        displayCheck(fieldsValue) {
          if (fieldsValue.ll_broadcast) {
            return true
          } else {
            return false
          }
        }
      },
      relationEvent: {
        type: 'card',
        cardType: 'relativeEvent',
        info: true,
        label: i18next.t('相關事件') ? i18next.t('相關事件') : ('相關事件'),
        displayCheck(fieldsValue) {
          if (fieldsValue.relationEvent) {
            return true
          } else {
            return false
          }
        }
      }
    }
  },
  stepSettingsForTaskEdit() {
    return [
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
              'remark',
              'taker',
              'expired_at',
              'sub_tasks',
              'system_subclasses',
              'apiAlert',
              'relationEvent',
              'll_broadcast',
              'article_version'
            ]
          }
        }
      }
    ]
  },
  stepSettingsForTaskCreate() {
    return [
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
              'remark',
              'taker',
              'expired_at',
              'sub_tasks',
              'system_subclasses',
              'apiAlert',
              'relationEvent',
              'll_broadcast',
              'article_version'
            ]
          }
        }
      }
    ]
  },
  async submitForCreate(_postData, navigation, currentUserId) {
    const _data = S_Task.getFormattedDataForCreate(_postData, currentUserId)
    try {
      // await new Promise((resolve) => setTimeout(resolve, 2000))
      const res = await S_Task.create({
        data: _data
      })
        .then(res => {
          Alert.alert(i18next.t('建立任務成功'))
          navigation.replace('TaskShow', {
            id: res.id
          })
        })
      await AsyncStorage.removeItem('TaskCreate')
    } catch (e) {
      console.error(e.message, 'e')
      Alert.alert(i18next.t('建立任務失敗'))
      navigation.goBack()
    }
  },
  async submitForEditTask(
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUserId
  ) {
    const _data = S_Task.getFormattedDataForEdit(_formattedValue, currentUserId)
    console.log(modelId, 'modelId');
    console.log(JSON.stringify(_data), '_data');
    try {
      const res = await S_Task.update({
        modelId: modelId,
        data: _data
      })
      Alert.alert(i18next.t('編輯成功'))
      navigation.replace('TaskShow', {
        id: modelId,
      })
    } catch (e) {
      console.error(e.message, 'e')
    }
  }
}
