import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const _params = {
      ...params
    }
    const res = await base.index({
      modelName: 'analysis/organization',
      params: _params
    })
    return res
  },
  getData(data) {
    const _data = {
      name: data.organization.name,
      risk: this.getRiskColor(data.checklist_risk_level),
      content: {
        checklist: data.checklist_result,
        event: data.event_count
      }
    }
    return _data
  },
  getRiskColor(riskLevel) {
    if (riskLevel === 25) {
      return 'green'
    } else if (riskLevel === 23) {
      return 'red'
    } else if (riskLevel === 22) {
      return 'yellow'
    } else if (riskLevel === 21) {
      return 'blue'
    } else {
      return 'green'
    }
  }
}
