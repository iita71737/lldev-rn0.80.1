import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'

export default {
  // riskStandard: {
  //   major: {
  //     label: i18next.t('高風險'),
  //     riskText: i18next.t('嚴重異常'),
  //     riskIcon: 'md-info',
  //     score: 23,
  //     icon: 'ws-filled-risk-high',
  //     color: $color.danger
  //   },
  //   minor: {
  //     label: i18next.t('中風險'),
  //     riskText: i18next.t('中度異常'),
  //     riskIcon: 'md-info',
  //     score: 22,
  //     icon: 'ws-filled-risk-medium',
  //     color: $color.yellow
  //   },
  //   ofi: {
  //     label: i18next.t('低風險'),
  //     riskText: i18next.t('輕度異常'),
  //     riskIcon: 'md-info',
  //     score: 21,
  //     icon: 'ws-filled-risk-low',
  //     color: $color.primary
  //   },
  //   pass: {
  //     label: i18next.t('合規'),
  //     riskText: i18next.t('合規'),
  //     riskIcon: 'md-check-circle',
  //     score: 25,
  //     icon: 'ws-filled-check-circle',
  //     color: $color.green
  //   }
  // },
  async index({ parentId, params }) {
    return base.index({
      parentId: parentId,
      parentName: 'audit_record',
      modelName: 'audit_record_answer',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getRiskNumInAnswers(answers, score) {
    const _ans = answers.filter(ans => {
      return ans.score?.value == score
    })
    return _ans.length
  },
  getRiskEffectCalcs(score, effects, answers) {
    const _calcs = []
    effects && effects.forEach(effect => {
      const _effectNum = this.getEffectNumFromAnsAndScore(
        answers,
        score,
        effect
      )
      console.log(_effectNum,'_effectNum222');
      _calcs.push({
        icon: effect.icon,
        label: effect.name,
        num: _effectNum,
        color: $color.danger
      })
    })
    _calcs.push({
      icon: "",
      label: i18next.t('重點關注'),
      num: 0,
      color: $color.primary
    })
    return _calcs
  },
  getEffectNumFromAnsAndScore(answers, score, effect) {
    const _num = []
    answers.forEach(answer => {
      if (answer.score == score.value) {
        if (answer.effects) {
          const _effect = answer.effects.find(ansEffect => {
            return ansEffect.id == effect.id
          })
          if (_effect) {
            _num.push(_effect)
          }
        } else if (answer.last_version && answer.last_version.effects) {
          const _effect = answer.last_version.effects.find(ansEffect => {
            return ansEffect.id == effect.id
          })
          if (_effect) {
            _num.push(_effect)
          }
        }
      }
    })
    return _num.length
  },
  getRiskWithEffect({ effects, answers }) {
    const riskStandard = {
      major: {
        label: i18next.t('Major(主要缺失)'),
        riskText: i18next.t('Major(主要缺失)'),
        riskIcon: 'md-info',
        score: 23,
        icon: 'ws-filled-risk-high',
        color: $color.danger
      },
      minor: {
        label: i18next.t('Minor(次要缺失)'),
        riskText: i18next.t('Minor(次要缺失)'),
        riskIcon: 'md-info',
        score: 22,
        icon: 'ws-filled-risk-high',
        color: $color.yellow
      },
      ofi: {
        label: i18next.t('OFI(待改善)'),
        riskText: i18next.t('OFI(待改善)'),
        riskIcon: 'md-info',
        score: 21,
        icon: 'ws-filled-risk-high',
        color: $color.primary
      },
      pass: {
        label: i18next.t('合規'),
        riskText: i18next.t('合規'),
        riskIcon: 'md-check-circle',
        score: 25,
        icon: 'ws-filled-check-circle',
        color: $color.green
      }
    }
    const _riskWithEffect = []
    for (let riskKey in riskStandard) {
      const risk = riskStandard[riskKey]
      const _num = this.getRiskNumInAnswers(answers, risk.score)
      _riskWithEffect.push({
        icon: risk.riskIcon,
        iconColor: risk.color,
        label: risk.riskText,
        num: _num,
        items: this.getRiskEffectCalcs(risk.score, effects, answers)
      })
    }
    return _riskWithEffect
  },
  getEffectNum({ effectId, answers }) {
    const numData = []
    answers.forEach(aRiskBlock => {
      numData.push({
        score: aRiskBlock.score
      })
      const _effect = aRiskBlock.ans.filter(answer => {
        const effectIds = answer.effects.map(effect => {
          return effect.id
        })
        return effectIds.includes(effectId)
      })
      return _effect.length
    })
  },
  async show({ modelId, params }) {
    return base.show({
      modelId: modelId,
      modelName: 'audit_record_answer',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getRisk(answers) {
    const riskStandard = {
      noYet: {
        label: i18next.t('尚無結果'),
        riskText: i18next.t('尚無結果'),
        riskIcon: 'md-help',
        score: '',
        icon: 'ws-filled-help',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d]
      },
      major: {
        label: i18next.t('高風險'),
        riskText: i18next.t('高風險'),
        riskIcon: 'md-info',
        score: 23,
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        bgc: $color.danger11l,
        colors: [$color.danger, $color.danger11l]
      },
      minor: {
        label: i18next.t('中風險'),
        riskText: i18next.t('中風險'),
        riskIcon: 'md-info',
        score: 22,
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        bgc: $color.yellow11l,
        colors: [$color.yellow, $color.yellow11l]
      },
      ofi: {
        label: i18next.t('低風險'),
        riskText: i18next.t('低風險'),
        riskIcon: 'md-info',
        score: 21,
        icon: 'ws-filled-risk-low',
        color: $color.primary,
        bgc: $color.primary11l,
        colors: [$color.primary, $color.primary11l]
      },
      pass: {
        label: i18next.t('合規'),
        riskText: i18next.t('合規'),
        riskIcon: 'md-check-circle',
        score: 25,
        icon: 'ws-filled-check-circle',
        color: $color.green,
        bgc: $color.green11l,
        colors: [$color.green, $color.green11l]
      },
    }

    let allScore = []
    answers.forEach((answer) => {
      if (answer.score?.value) {
        allScore.push(answer.score?.value)
      }
    });

    const risk = allScore.some((score) => score == 23)
      ? 'major'
      : allScore.some(score => score == 22)
        ? 'minor'
        : allScore.some(score => score == 21)
          ? 'ofi'
          : allScore.some(score => score == 25)
            ? 'pass'
            : 'noYet'
    if (allScore.length === answers.length) {
      return riskStandard[risk];
    }
    else {
      return riskStandard['noYet'];
    }
  },
}
