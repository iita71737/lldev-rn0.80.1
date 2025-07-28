import React from 'react'
import { Pressable, Platform, TouchableOpacity } from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsNavMutiLayerCheck,
  LlLvInfoMultiLayer
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'

const WsStateBelongstoManyModalPicker002 = props => {
  const { windowWidth, windowHeight } = layouts
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = [],
    onChange,
    isError,
    placeholder = `${t('選擇')}`,
    title = t('選擇'),
    modelName,
    serviceIndexKey,
    nameKey,
    hasMeta = false,
    getAll = !hasMeta,
    params
  } = props

  // State
  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState([])
  const [text, setText] = React.useState()

  // Function
  const $_setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        value.forEach(item => {
          if (_value.id == item.id) {
            if (item[nameKey]) {
              _text.push(item[nameKey])
            } else if (modelName === 'factory') {
              _text.push(t('所有轄下單位'))
            }
          }
        })
      })
      setText(_text.join(', '))
    }
  }
  const $_onSubmit = () => {
    setModalVisible(false)
    onChange(fetchItems)
  }
  const $_onClose = () => {
    setModalVisible(false)
  }
  const $_onSelectAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      if (!_value.includes(item.id)) {
        _value.push(item)
      }
    })
    setFetchItems(_value)
  }
  const $_onClearAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      const tarIndex = _value.findIndex(e => {
        return e.id == item.id
      })
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    })
    setFetchItems(_value)
  }
  const $_onPress = (item) => {
    let _fetchItems = fetchItems ? [...fetchItems] : []
    const tarIndex = _fetchItems.findIndex(e => {
      return e.id == item.id
    })
    if (tarIndex >= 0) {
      _fetchItems.splice(tarIndex, 1)
    }
    if (tarIndex < 0) {
      _fetchItems.push(item)
    }
    setFetchItems(_fetchItems)
  }

  React.useEffect(() => {
    if (value) {
      $_setText()
    }
  }, [value])

  // Render
  return (
    <>
      <WsBtnSelect
        onPress={() => {
          setModalVisible(true)
          setFetchItems([...value])
        }}
        placeholder={placeholder}
        text={text}
        borderWidth={0.3}
        borderRadius={5}
        isError={isError}
      />
      <WsModal
        childrenScroll={true}
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
        ]}>
        <WsFlex
          style={{
            padding: 16
          }}>
          <WsFlex>
            <TouchableOpacity
              onPress={() => {
                $_onSelectAll(fetchItems)
              }}>
              <WsText color={$color.primary} size={14}>
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
                $_onClearAll(fetchItems)
              }}>
              <WsText color={$color.primary} size="14">
                {t('全取消')}
              </WsText>
            </TouchableOpacity>
          </WsFlex>
        </WsFlex>
        <WsInfiniteScroll
          hasMeta={hasMeta}
          getAll={getAll}
          service={Services[modelName]}
          serviceIndexKey={serviceIndexKey}
          params={params}
          renderItem={({ item, index }) => {
            return (
              <>
                <WsNavMutiLayerCheck
                  parentItem={item}
                  items={item.child_factories ? item.child_factories : item.factories ? item.factories : []}
                  value={fetchItems}
                  onChange={item => {
                    $_onPress(item)
                  }}
                >
                </WsNavMutiLayerCheck>
              </>
            )
          }}
        />
      </WsModal>
    </>
  )
}

export default WsStateBelongstoManyModalPicker002
