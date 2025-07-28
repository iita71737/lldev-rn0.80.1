import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async factoryIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'factory_index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async simplifyFactoryIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'simplify_factory_index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create(data) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async restart(parentId) {
    return base.create({
      // preUrl: S_Processor.getFactoryPreUrl(),
      parentId: parentId,
      parentName: 'user',
      modelName: 'restart',
      data: {
        ...S_Processor.getFactoryData()
      }
    })
  },
  async disable(parentId) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      parentId: parentId,
      parentName: 'user',
      modelName: 'disabled',
      data: {
        ...S_Processor.getFactoryData()
      }
    })
  },
  async forgetPassword(email) {
    return base.create({
      modelName: 'auth/forgetpassword/request/no_captcha',
      data: {
        ...S_Processor.getFactoryData(),
        email: email
      }
    })
  },
  async verifyEmail(email) {
    return base.create({
      modelName: 'verifyemail/request',
      data: {
        ...S_Processor.getFactoryData(),
        email: email
      }
    })
  },
  async TemporaryPasswordSetting(email) {
    return base.create({
      modelName: 'temporary_password/request',
      data: {
        ...S_Processor.getFactoryData(),
        email: email
      }
    })
  },
  async authUpdate({ locale }) {
    const res = await base.update({
      modelName: 'auth/user',
      data: locale
    })
    return res
  },
  getStatus(item) {
    if (!item.email_verified_at && item.is_active === 0) {
      return 'no_use'
    } else if (
      !item.email_verified_at &&
      !item.activated_at &&
      item.is_active === 1
    ) {
      return 'inviting'
    } else if (item.is_active === 1 && item.activated_at === 2) {
      return 'disabled'
    } else if (item.is_active === 1) {
      return 'using'
    }
  }
}
