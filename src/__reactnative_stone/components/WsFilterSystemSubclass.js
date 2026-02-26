// @refresh reset 
import React from 'react'
import { Pressable, View } from 'react-native'
import { WsText, WsNavCheck, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const WsFilterSystemSubclass = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { value, onChange } = props

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)

  const _allSubClasses = React.useMemo(() => {
    const _value = value ? [...value] : []
    systemClasses.forEach(systemClass => {
      systemClass.system_subclasses.forEach(systemSubclass => {
        _value.push(systemSubclass.id)
      })
    })

    return _value
  }, [systemClasses]);

  // Function
  const $_onSystemClassSelectAll = systemClass => {
    const _value = value ? [...value] : []
    systemClass.system_subclasses.forEach(systemSubclass => {
      if (!_value.includes(systemSubclass.id)) {
        _value.push(systemSubclass.id)
      }
    })
    onChange(_value)
  }
  const $_onSystemClassClearAll = systemClass => {
    const _value = value ? [...value] : []
    systemClass.system_subclasses.forEach(systemSubclass => {
      const tarIndex = _value.findIndex(e => {
        return e == systemSubclass.id
      })
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    })
    onChange(_value)
  }
  const $_onSystemSubclassPress = ($event, systemSubclass) => {
    const _value = value ? [...value] : []
    const tarIndex = _value.findIndex(e => {
      return e == systemSubclass.id
    })
    if (!$event) {
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    } else {
      if (tarIndex < 0) {
        _value.push(systemSubclass.id)
      }
    }
    onChange(_value)
  }
  const _CheckValue = systemSubclass => {
    if (!value) {
      return false
    } else if (value.includes(systemSubclass.id)) {
      return true
    } else {
      return false
    }
  }
  const $_ClearAll = () => {
    const _value = []
    onChange(_value)
  }
  const $_SelectAll = () => {
    onChange(_allSubClasses)
  }

  // 簡單的陣列相等：長度一樣且每個元素都在對方裡（用排序避免順序問題）
  const arraysEqual = (a: number[] = [], b: number[] = []) => {
    if (a.length !== b.length) return false
    const aa = [...a].sort((x, y) => x - y)
    const bb = [...b].sort((x, y) => x - y)
    for (let i = 0; i < aa.length; i++) {
      if (aa[i] !== bb[i]) return false
    }
    return true
  }

  React.useEffect(() => {
    if (!Array.isArray(systemClasses) || systemClasses.length === 0) return
    // If value is already an array (including empty array), respect user choice.
    // Only auto-fill defaults when value is undefined/null.
    if (Array.isArray(value)) return

    // 取得「全選」 id 清單（扁平 + 去重）
    const allIds: number[] = []
    systemClasses.forEach(sc => {
      (sc?.system_subclasses ?? []).forEach(ssc => {
        if (!allIds.includes(ssc.id)) allIds.push(ssc.id)
      })
    })

    onChange(allIds)
  }, [systemClasses, value, onChange])

  // Render
  return (
    <>
      {systemClasses && systemClasses.length > 0 && (
        <WsFlex
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: $color.gray2l,
            paddingTop: 16,
          }}>
          <WsText
            color={$color.black}
            size={14}
            style={{
              flex: 1
            }}
            fontWeight="700">
            {t('全部')}
          </WsText>
          <WsFlex>
            <Pressable
              onPress={() => {
                $_SelectAll()
              }}>
              <WsText color={$color.primary} size="14">
                {t('全選')}
              </WsText>
            </Pressable>
            <WsText
              color={$color.primary}
              size="14"
              style={{
                paddingLeft: 16,
                paddingRight: 16
              }}>
              |
            </WsText>
            <Pressable
              onPress={() => {
                $_ClearAll()
              }}>
              <WsText color={$color.primary} size="14">
                {t('全取消')}
              </WsText>
            </Pressable>
          </WsFlex>
        </WsFlex>
      )
      }

      {systemClasses.map((systemClass, systemClassIndex) => {
        return (
          <View key={systemClassIndex}>
            <WsFlex
              style={{
                padding: 16
              }}>
              <WsText
                color={$color.black}
                size={14}
                style={{
                  flex: 1
                }}
                fontWeight="700">
                {t(systemClass.name)}
              </WsText>
              <WsFlex>
                <Pressable
                  onPress={() => {
                    $_onSystemClassSelectAll(systemClass)
                  }}>
                  <WsText color={$color.primary} size="14">
                    {t('全選')}
                  </WsText>
                </Pressable>
                <WsText
                  color={$color.primary}
                  size="14"
                  style={{
                    paddingLeft: 16,
                    paddingRight: 16
                  }}>
                  |
                </WsText>
                <Pressable
                  onPress={() => {
                    $_onSystemClassClearAll(systemClass)
                  }}>
                  <WsText color={$color.primary} size="14">
                    {t('取消')}
                  </WsText>
                </Pressable>
              </WsFlex>
            </WsFlex>
            {systemClass.system_subclasses.map(
              (systemSubclass, systemSubclassIndex) => {
                return (
                  <WsNavCheck
                    testID={systemSubclass.name}
                    value={_CheckValue(systemSubclass)}
                    onChange={$event => {
                      $_onSystemSubclassPress($event, systemSubclass)
                    }}
                    key={`${systemClassIndex} -${systemSubclassIndex} `}>
                    {t(systemSubclass.name)}
                  </WsNavCheck>
                )
              }
            )}
          </View>
        )
      })}
    </>
  )
}

export default WsFilterSystemSubclass
