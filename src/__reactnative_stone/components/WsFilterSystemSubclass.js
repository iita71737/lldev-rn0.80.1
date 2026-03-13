// @refresh reset 
import React from 'react'
import { Pressable, View } from 'react-native'
import { WsText, WsNavCheck, WsFlex, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const WsFilterSystemSubclass = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { value, onChange } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentFactory = useSelector(state => state.data.currentFactory)

  const _factoryPermissionMatch = React.useMemo(() => {
    const _currentFactoryId = currentFactory?.id
    const _factoryItems = currentUser?.user_factory_system_subclasses
    if (!_currentFactoryId || !Array.isArray(_factoryItems)) {
      return null
    }

    return _factoryItems.find(item => {
      return item?.factory?.id === _currentFactoryId
    })
  }, [currentFactory?.id, currentUser?.user_factory_system_subclasses])

  const _factoryAllowedSubclasses = React.useMemo(() => {
    if (!_factoryPermissionMatch || !Array.isArray(_factoryPermissionMatch.system_subclasses)) {
      return []
    }
    return _factoryPermissionMatch.system_subclasses
  }, [_factoryPermissionMatch])

  const _factoryAllowedSubclassIds = React.useMemo(() => {
    const _ids = []
    _factoryAllowedSubclasses.forEach(systemSubclass => {
      const _id = systemSubclass?.id
      if (_id && !_ids.includes(_id)) {
        _ids.push(_id)
      }
    })
    return _ids
  }, [_factoryAllowedSubclasses])

  const _allSubClasses = React.useMemo(() => {
    const _value = []
    if (!Array.isArray(systemClasses)) {
      return _value
    }
    systemClasses.forEach(systemClass => {
      ; (systemClass?.system_subclasses || []).forEach(systemSubclass => {
        if (!_value.includes(systemSubclass.id)) {
          _value.push(systemSubclass.id)
        }
      })
    })
    return _value
  }, [systemClasses])

  const $_hasPermission = systemSubclass => {
    return _factoryAllowedSubclassIds.includes(systemSubclass?.id)
  }

  // Function
  const $_onSystemClassSelectAll = systemClass => {
    const _value = value ? [...value] : []
      ; (systemClass?.system_subclasses || []).forEach(systemSubclass => {
        if (!_value.includes(systemSubclass.id)) {
          _value.push(systemSubclass.id)
        }
      })
    onChange(_value)
  }
  const $_onSystemClassClearAll = systemClass => {
    const _value = value ? [...value] : []
      ; (systemClass?.system_subclasses || []).forEach(systemSubclass => {
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

  React.useEffect(() => {
    if (!Array.isArray(systemClasses) || systemClasses.length === 0) return
    // If value is already an array (including empty array), respect user choice.
    // Only auto-fill defaults when value is undefined/null.
    if (Array.isArray(value)) return

    onChange(_allSubClasses)
  }, [systemClasses, _allSubClasses, value, onChange])

  // Render
  return (
    <>
      <WsFlex
        style={{
          paddingHorizontal: 16,
          paddingTop: 4
        }}
      >
        <WsIcon
          name="md-info-outline"
          size={20}
          color={$color.danger}
        />
        <WsText
          color={$color.danger}
          size={12}
          style={{
            marginLeft: 4
          }}
        >
          {t('紅字為無權限')}
        </WsText>
      </WsFlex>

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
                  flex: 1,
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
            {(systemClass?.system_subclasses || []).map(
              (systemSubclass, systemSubclassIndex) => {
                return (
                  <WsNavCheck
                    testID={systemSubclass.name}
                    value={_CheckValue(systemSubclass)}
                    onChange={$event => {
                      $_onSystemSubclassPress($event, systemSubclass)
                    }}
                    fontColor={!$_hasPermission(systemSubclass) ? $color.danger : $color.black}
                    key={`${systemClassIndex}-${systemSubclassIndex}`}
                  >
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
