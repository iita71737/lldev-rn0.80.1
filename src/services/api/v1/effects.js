import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import { useSelector } from 'react-redux'
import gColor from '@/__reactnative_stone/global/color'
import S_Processor from '@/services/app/processor'

export default {
  async index(params) {
    return base.index({
      modelName: 'effect',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getEffectsWithRisk(effectsNum) {
    const effects = useSelector(state => state.data.effects);
    const effectsWithRisk = []
    effects.forEach(risk => {
      const num = effectsNum.filters(effectNum => {
        risk.id == effectNum.id
        return effectNum.id
      })
      effectsWithRisk.push({
        icon: effects.icon,
        label: effects.name,
        num: num,
        color: gColor.danger,
      })
    })
    return effectsWithRisk
  }
}