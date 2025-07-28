import base from '@/__reactnative_stone/services/wasaapi/v1/__base'

export default {
  async index(params) {
    return base.index({
      modelName: 'package_language',
      params: params
    })
  }
}
