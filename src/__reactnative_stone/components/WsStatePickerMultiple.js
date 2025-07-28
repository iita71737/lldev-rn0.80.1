import React from 'react'
import { Pressable, Platform } from 'react-native'
import { WsBtnSelect, WsModal, WsFlex, WsText, WsNavCheck } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsStatePickerMultiple = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value,
    onChange,
    placeholder = `${t('選擇')}`,
    icon,
    items,
    title = t('選擇')
  } = props

  // State
  const [modalVisible, setModalVisible] = React.useState(false)

  // Function
  const _setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        items.forEach(item => {
          if (_value == item.value) {
            _text.push(item.name)
          } else if (
            item.value.includes(_value) &&
            !_text.includes(item.name)
          ) {
            _text.push(item.name)
          }
        })
      })
      return _text.join(', ')
    }
  }
  const $_onSubmit = () => {
    setModalVisible(false)
  }

  const $_onClose = () => {
    setModalVisible(false)
  }
  const $_onSelectAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      if (!_value.includes(item.value)) {
        _value.push(item.value)
      }
    })
    onChange(_value)
  }
  const $_onClearAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      const tarIndex = _value.findIndex(e => {
        return e == item.value
      })
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    })
    onChange(_value)
  }
  const $_onPress = ($event, item) => {
    const _value = value ? [...value] : []
    const tarIndex = _value.findIndex(e => {
      if (Array.isArray(item.value)) {
        return e == item.value[0]
      } else {
        return e == item.value
      }
    })
    if (!$event) {
      if (tarIndex >= 0) {
        if (Array.isArray(item.value)) {
          _value.splice(tarIndex, item.value.length)
        } else {
          _value.splice(tarIndex, 1)
        }
      }
    } else {
      if (tarIndex < 0) {
        if (Array.isArray(item.value)) {
          item.value.forEach(itemValue => {
            _value.push(itemValue)
          })
        } else {
          _value.push(item.value)
        }
      }
    }
    onChange(_value)
  }
  const _CheckValue = item => {
    if (Array.isArray(item.value)) {
      let _check = false
      item.value.forEach(e => {
        if (value && value.includes(e)) {
          _check = true
        }
      })
      return _check
    } else if (!value) {
      return false
    } else if (value.includes(item.value)) {
      return true
    } else {
      return false
    }
  }

  // Render
  return (
    <>
      <WsBtnSelect
        icon={icon}
        onPress={() => {
          setModalVisible(true)
        }}
        placeholder={placeholder}
        text={_setText()}
      />
      <WsModal
        onBackButtonPress={$_onClose}
        headerLeftOnPress={$_onClose}
        footerBtnRightOnPress={$_onSubmit}
        footerBtnLeftText={t('重設')}
        footerBtnRightText={t('確定')}
        visible={modalVisible}
        title={title}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null
        ]}
        animationType="slide">
        <WsFlex
          style={{
            padding: 16
          }}>
          <WsFlex>
            <Pressable
              onPress={() => {
                $_onSelectAll(items)
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
                $_onClearAll(items)
              }}>
              <WsText color={$color.primary} size="14">
                {t('全取消')}
              </WsText>
            </Pressable>
          </WsFlex>
        </WsFlex>
        {items && (
          <>
            {items.map((item, itemIndex) => {
              return (
                <WsNavCheck
                  value={_CheckValue(item)}
                  onChange={$event => {
                    $_onPress($event, item)
                  }}
                  key={`${title}-${itemIndex}`}>
                  {item.name}
                </WsNavCheck>
              )
            })}
          </>
        )}
      </WsModal>
    </>
  )
}

export default WsStatePickerMultiple
