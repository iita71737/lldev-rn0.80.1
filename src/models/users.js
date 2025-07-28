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
        label: i18next.t('人員名稱')
      },
      email: {
        label: i18next.t('角色信箱'),
        type: 'email'
      },
      user_factory_roles: {
        type: 'belongstomany',
        modelName: 'user_factory_role',
        nameKey: 'name',
        label: i18next.t('選擇角色')
      }
      // user_factory_system_subclasses: {
      //   type: 'modelsSystemClass',

      // }
    }
  }
}
