import moment from 'moment'
import store from '@/store'
import i18next from 'i18next'

export default {
  getFactoryId() {
    const state = store.getState()
    return state.data.currentFactory.id
  },

  getFields() {
    const _factoryId = this.getFactoryId()
    return {
      name: {
        label: i18next.t('名稱'),
        rules: 'required'
      },
      system_subclasses: {
        type: 'modelsSystemClass'
      },
      owner: {
        type: 'belongsto',
        label: i18next.t('負責人'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
        onPress: () => {
          navigation.navigate('ChangeShow')
        }
      },
      change_assignment: {
        type: 'belongsto',
        label: 'evaluator',
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
      },
      version_number: {
        label: i18next.t('版本')
      },
      updated_at: {
        type: 'date',
        label: i18next.t('建立日期')
      },
      expired_date: {
        type: 'date',
        label: i18next.t('到期日')
      },
      attaches: {
        type: 'filesAndImages',
        label: i18next.t('附件'),
        uploadUrl: `factory/${_factoryId}/change_version/attach`
      }
    }
  },
  //轉換change+version格式 用於作業
  getChangeDataAssignment(change) {
    return {
      id: change.id,
      name: change.name,
      owner: {
        name: change.last_version.owner ? change.last_version.owner.name : null,
        avatar: change.last_version.owner
          ? change.last_version.owner.avatar
          : null
      },
      version:
        change.last_version && change.last_version.version_number
          ? `ver${change.last_version.version_number}.`
          : null,
      lastVersionId: change.last_version.id,
      versions: change.last_versions,
      evaluateExpiredAt: moment(change.last_version.expired_date).format(
        'YYYY-MM-DD'
      ),
      attaches: change.last_version.attaches
    }
  }
}
