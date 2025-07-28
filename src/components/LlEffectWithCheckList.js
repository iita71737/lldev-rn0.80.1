import React from 'react'
import { LlCheckListRecordCard002 } from '@/components'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'

const LlEffectWithCheckListRisk = props => {
  const { t, i18n } = useTranslation()

  const {
    payload,
    effect,
    keypoint
  } = props

  const currentFactory = useSelector(state => state.data.currentFactory)
  const effects = useSelector(state => state.data.effects)

  // State
  const [data, setDate] = React.useState()
  // console.log(JSON.stringify(data),'data---');

  // Function
  const $_setItem = itemIndex => {
    const _effect = []
    if (
      effect && effect.length > 0 &&
      effects && effects.length > 0
    ) {
      // 計算風險
      effects.forEach((serviceEffect, serviceEffectIndex) => {
        effect.forEach((payloadEffect, payloadEffectIndex) => {
          if (serviceEffect.id == payloadEffect.id) {
            const _num = payloadEffect.number ? payloadEffect.number[itemIndex] : 0
            _effect.push({
              icon: serviceEffect.icon ? serviceEffect.icon : null,
              label: serviceEffect.name ? serviceEffect.name : null,
              num: _num,
              color: $color.danger
            })
          }
        })
      })
      // 計算重點關注
      const _numKeyPoint = keypoint.number[itemIndex]
      _effect.push({
        icon: null,
        label: t('重點關注'),
        num: _numKeyPoint,
        color: $color.primary
      })
    } else {
      // 計算重點關注
      const _numKeyPoint = keypoint.number[itemIndex]
      _effect.push({
        icon: null,
        label: t('重點關注'),
        num: _numKeyPoint ? _numKeyPoint : '-',
        color: $color.primary
      })
    }
    return _effect
  }

  const $_setPayload = () => {
    const _data = []
    payload.forEach((item, itemIndex) => {
      let _items = $_setItem(itemIndex)

      // ✅ 若為 level 25，將所有項目的 num 改為 '-'
      if (item.level === 25) {
        _items = _items.map(item => ({
          ...item,
          num: '-'
        }))
      }

      _data.push({
        level: item.level,
        number: item.number,
        label:
          item.level == 23
            ? t('高風險')
            : item.level == 22
              ? t('中風險')
              : item.level == 21
                ? t('低風險')
                : t('無異常'),
        iconColor:
          item.level == 23
            ? $color.danger
            : item.level == 22
              ? $color.yellow
              : item.level == 21
                ? $color.primary
                : $color.green,
        items: _items
      })
    })
    _data.sort(function (a, b) {
      if (b && b.level !== 25) {
        return 1; // 正數時，後面的數放在前面
      } else {
        return -1 // 負數時，前面的數放在前面
      }
    });
    setDate(_data)
  }

  React.useEffect(() => {
    if (effects && payload) {
      $_setPayload()
    }
  }, [effects, payload])

  return (
    <>
      {data && (
        <>
          {data.map((level, levelIndex) => {
            return (
              <LlCheckListRecordCard002
                key={levelIndex}
                icon={
                  level.level == 23 || 22 || 21
                    ? 'ws-filled-warning'
                    : 'md-check-circle'
                }
                label={t(level.label)}
                items={level.items}
                num={level.number}
                iconColor={level.iconColor}
                style={{
                  marginBottom: 8,
                  paddingHorizontal: 16
                }}
              />
            )
          })}
        </>
      )}
    </>
  )
}

export default LlEffectWithCheckListRisk
