// @refresh reset 
import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { WsText, WsNavCheck, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import scopes from '@/__config/scopes'

const WsFilterScopes = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const entries = Object.entries(scopes)

  // Props
  const {
    value,
    onChange
  } = props

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
    // onChange(_allSubClasses)
  }

  // Render
  return (
    <>
      {/* {entries && entries.length > 0 && (
        <WsFlex
          style={{
            padding: 16,
            borderBottomWidth: .5,
            borderBottomColor: $color.gray2l,
          }}>
          <WsText
            color={$color.black}
            size={14}
            style={{
              flex: 1
            }}
            fontWeight="700">
            {t('角色權限')}
          </WsText>
          <WsFlex>
            <TouchableOpacity
              onPress={() => {
                $_SelectAll()
              }}>
              <WsText color={$color.primary} size="14">
                {t('全選')}
              </WsText>
            </TouchableOpacity>
            <WsText
              color={$color.primary}
              size="14"
              style={{
                paddingLeft: 16,
                paddingRight: 16
              }}>
              |
            </WsText>
            <TouchableOpacity
              onPress={() => {
                $_ClearAll()
              }}>
              <WsText color={$color.primary} size="14">
                {t('全取消')}
              </WsText>
            </TouchableOpacity>
          </WsFlex>
        </WsFlex>
      )} */}

      {entries.map(([routeName, scopes]) => (
        <View key={routeName}>
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
              {t(routeName)}
            </WsText>
            <WsFlex>
              <TouchableOpacity
                onPress={() => {
                  // $_onSystemClassSelectAll(systemClass)
                }}>
                <WsText color={$color.primary} size="14">
                  {t('全選')}
                </WsText>
              </TouchableOpacity>
              <WsText
                color={$color.primary}
                size="14"
                style={{
                  paddingLeft: 16,
                  paddingRight: 16
                }}>
                |
              </WsText>
              <TouchableOpacity
                onPress={() => {
                  // $_onSystemClassClearAll(systemClass)
                }}>
                <WsText color={$color.primary} size="14">
                  {t('取消')}
                </WsText>
              </TouchableOpacity>
            </WsFlex>
          </WsFlex>
          {scopes.map(
            (scope, scopeIndex) => {
              return (
                <WsNavCheck
                textLeftWidthTimes={1}
                  value={_CheckValue(scope)}
                  onChange={$event => {
                    // $_onSystemSubclassPress($event, scope)
                  }}
                  key={scopeIndex}
                >
                  {t(scope)}
                </WsNavCheck>
              )
            }
          )}
        </View>
      ))}
    </>
  )
}

export default WsFilterScopes

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  row: {
    marginBottom: 24
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  scopes: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  scopeTag: {
    backgroundColor: '#eee',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12
  }
})
