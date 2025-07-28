import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async create({ params }) {
    const _data = {
      ...params
    }
    return base.create({
      modelName: 'legal_inquiry',
      data: {
        ..._data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  formattedParams($event, currentUser) {
    const _data = {
      user_payload: {
        id: currentUser && currentUser.id ? currentUser.id : null,
        name: currentUser.name
      },
      contact_for: $event.object,
      contact_person: $event.contact_person,
      contact_way: $event.contact_way,
      tel: $event.tel,
      email: $event.email,
      remark: $event.remark,
      attaches: $event.attaches
    }
    return _data
  }
}
