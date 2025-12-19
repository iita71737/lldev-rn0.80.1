import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      modelName: `meeting_template_field`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
}
