import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_EventType from '@/services/api/v1/event_type'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'event',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async indexBoard({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'event/board/index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async currentAddIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'event/current_add',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'event',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'event',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async eventTypeIndex(params) {
    return S_EventType.index(params)
    return base.index({
      modelName: 'event_type',
      params: params
    })
  },
  async update({ modelId, data }) {
    console.log(data, 'data--');
    return base.update({
      modelName: 'event',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'event',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  getStatusFont(event, t) {
    let _font = ''
    if (event.event_status === 3) {
      _font = t('處理完畢')
    } else if (event.event_status === 2) {
      _font = t('列管中')
    } else {
      _font = t('處理中')
    }
    return _font
  },
  getStatusBgColor(event) {
    let _color = ''
    if (event.event_status === 3) {
      _color = $color.gray6l
    } else if (event.event_status === 2) {
      _color = $color.danger10l
    } else {
      _color = $color.yellow11l
    }
    return _color
  },
  async organizationCurrentAddIndex({ params }) {
    const _params = {
      ...params
    }
    let preUrl = ''
    if (params.type === 'event') {
      preUrl = `organization/${params.organization}/event/current_add`
    }
    return base.index({
      params: _params,
      preUrl: preUrl
    })
  },
  // async getAllMetaData(params) {
  //   // 意外事故
  //   const accidents = this.index({
  //     params: {
  //       ...params,
  //       event_type: '028a1f02-9354-11ee-89b0-42010a8c000b'
  //     }
  //   })
  //   // 外部查廠
  //   const externalAudits = this.index({
  //     params: {
  //       ...params,
  //       event_type: '028a1d42-9354-11ee-89b0-42010a8c000b'
  //     }
  //   })
  //   // 接話罰單
  //   const penaltyNotices = this.index({
  //     params: {
  //       ...params,
  //       event_type: '028a1fa6-9354-11ee-89b0-42010a8c000b'
  //     }
  //   })
  //   // 排放異常
  //   const dischargingWastewater = this.index({
  //     params: {
  //       ...params,
  //       event_type: '028a2246-9354-11ee-89b0-42010a8c000b'
  //     }
  //   })
  //   // 其他
  //   const others = this.index({
  //     params: {
  //       ...params,
  //       event_type: '028a202c-9354-11ee-89b0-42010a8c000b'
  //     }
  //   })
  //   const _res = await Promise.all([accidents, externalAudits, penaltyNotices, dischargingWastewater, others])
  //     .then(res => {
  //       return res
  //     })
  //     .catch(e => {
  //       console.error(e, 'e');
  //     })
  //   return _res
  // },
  formattedForFileStore(attaches) {
    return attaches.map(item => {
      const newItem = {
        file: item.file.id
      };
      if (item.file_version) {
        newItem.file_version = item.file_version.id;
      }
      return newItem;
    });
  },
  getFormattedData(data, currentUser) {
    const occurDate = moment(data.occur_at).format('YYYY-MM-DD HH:mm:ss')
    const _data = {
      event_status: data.event_status,
      event_type: data.event_type,
      improvement_limited_period: data.improvement_limited_period
        ? data.improvement_limited_period
        : null,
      name: data.name,
      owner: data.owner,
      remark: data.remark,
      occur_at: data.occur_at
        ? moment(occurDate)
        : null,
      system_classes: data.system_classes,
      system_subclasses: data.system_subclasses,
      // 原始spec
      // attaches: data.attaches ? data.attaches : [],
      // 檔案庫spec
      attaches: data.file_attaches ? this.formattedForFileStore(data.file_attaches) : [],
      creator: currentUser && currentUser.id ? currentUser.id : null
    }
    return _data
  }
}
