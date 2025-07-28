import React from 'react'
import {
  Pressable,
  Platform,
  TouchableOpacity,
  View
} from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsInfiniteScrollMultiple,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsState
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'

const WsStateMultipleBelongstoManyModalPicker = props => {
  const { windowWidth, windowHeight } = layouts
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = [],
    onChange,
    isError,
    selectAllVisible = true,
    cancelAllVisible = true,
    searchBarVisible = false,
    placeholder = `${t('選擇')}`,
    title = t('選擇'),
    innerLabel,
    modelName = [],
    serviceIndexKey,
    nameKey,
    params,
    hasMeta = false,
    defaultValue = [],
    testID
  } = props

  // State
  const [modalVisible, setModalVisible] = React.useState(false)
  const [selectedItems, setSelectedItems] = React.useState([])
  const [search, setSearch] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      ...params,
    }
    if (search) {
      _params.search = search
    } else {
      delete _params.search
    }
    return _params
  }, [search]);

  // Function
  const $_countBadge = () => {
    if (value && value.length > 0) {
      return value.length
    }
  }
  const _setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        _text.push(_value.name)
      })
      return _text.join(', ')
    }
  }
  const $_onSubmit = () => {
    setModalVisible(false)
    onChange(selectedItems)
  }

  const $_onClose = () => {
    setModalVisible(false)
  }

  const $_onSelectAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      if (!_value.includes(item.id)) {
        _value.push(item.id)
      }
    })
    setSelectedItems(_value)
  }
  const $_onClearAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      const tarIndex = _value.findIndex(e => {
        return e == item.id
      })
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    })
    setSelectedItems(_value)
  }
  const $_onPress = ($event, item, _m) => {
    const _fetchItems = selectedItems ? JSON.parse(JSON.stringify(selectedItems)) : []
    const tarIndex = _fetchItems.findIndex(e => {
      return e.id == item.id
    })
    if (!$event) {
      if (tarIndex >= 0) {
        _fetchItems.splice(tarIndex, 1)
      }
    } else {
      if (tarIndex < 0) {
        item.role_type = _m
        _fetchItems.push(item)
      }
    }
    setSelectedItems(_fetchItems)
  }

  const $_CheckValue = item => {
    if (!selectedItems) {
      return false
    }
    return selectedItems.some(x => x.id === item.id)
  }

  // Render
  return (
    <>
      <WsBtnSelect
        testID={testID}
        onPress={() => {
          setModalVisible(true)
          setSelectedItems([...defaultValue, ...value])
        }}
        placeholder={placeholder}
        badge={$_countBadge()}
        text={_setText()}
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
        footerDisable={false}
        visible={modalVisible}
        title={title}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null
        ]}>
        <View
          style={{
            flex: 1,
            // borderWidth: 1
          }}
        >
          {(selectAllVisible || cancelAllVisible) && (
            <WsFlex
              style={{
                padding: 16
              }}>
              <WsFlex>
                {selectAllVisible && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        $_onSelectAll(selectedItems)
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
                  </>
                )}
                {cancelAllVisible && (
                  <TouchableOpacity
                    onPress={() => {
                      $_onClearAll(selectedItems)
                    }}>
                    <WsText color={$color.primary} size="14">
                      {t('全取消')}
                    </WsText>
                  </TouchableOpacity>
                )}
              </WsFlex>
            </WsFlex>
          )}

          {searchBarVisible && (
            <WsState
              style={{
                padding: 16,
              }}
              type="search"
              placeholder={t('搜尋')}
              value={search}
              onChange={setSearch}
            >
            </WsState>
          )}

          {modelName &&
            modelName.length > 0 && (
              modelName.map((_m, index) => {
                return (
                  <>
                    {innerLabel &&
                      innerLabel.length > 0 && (
                        <WsText
                          style={{
                            padding: 16,
                            color: $color.primary
                          }}
                        >
                          {t(innerLabel[index])}
                        </WsText>
                      )}

                    <WsInfiniteScroll
                      service={Services[_m]}
                      serviceIndexKey={serviceIndexKey}
                      params={__params}
                      hasMeta={hasMeta}
                      renderItem={({ item, index }) => {
                        return (
                          <WsNavCheck
                            testID={`${item.name}`}
                            key={`${item.name}${index}`}
                            value={$_CheckValue(item)}
                            onChange={$event => {
                              $_onPress($event, item, _m)
                            }}>
                            {item.name}
                          </WsNavCheck>
                        )
                      }}
                    />
                  </>
                )
              })
            )}

          <View
            style={{
              height: 100
            }}
          ></View>

        </View >

      </WsModal>
    </>
  )
}

export default WsStateMultipleBelongstoManyModalPicker
