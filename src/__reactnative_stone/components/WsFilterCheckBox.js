import React from 'react'
import {
  FlatList,
  TouchableOpacity,
  View
} from 'react-native'
import {
  WsText,
  WsNavCheck,
  WsFlex,
  WsState,
  WsBtnSelect,
  WsModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsFilterCheckBox = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value,
    onChange,
    items,
    label,
    searchVisible = false,
    defaultSelected = true,
    placeholder = `${t('選擇')}`,
    modelName,
    isError,
    title = t('選擇'),
    selectAllVisible = true,
    cancelAllVisible = true,
    searchBarVisible = false,
    filterVisible = false,
    defaultValue = [],
    nameKey = 'name'
  } = props

  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState([])
  const [searchValue, setSearchValue] = React.useState(null)
  const [text, setText] = React.useState()


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

  const $_onPress = ($event, item) => {
    const _fetchItems = fetchItems ? [...fetchItems] : []
    const tarIndex = _fetchItems.findIndex(e => {
      return e.id == item.id
    })
    if (!$event) {
      if (tarIndex >= 0) {
        _fetchItems.splice(tarIndex, 1)
      }
    } else {
      if (tarIndex < 0) {
        _fetchItems.push(item)
      }
    }
    setFetchItems(_fetchItems)
  }

  const _CheckValue = item => {
    const _fetchItems = fetchItems.map(item => item.id)
    if (!fetchItems) {
      return false
    } else if (_fetchItems.includes(item.id)) {
      return true
    } else {
      return false
    }
  }

  const $_setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        value.forEach(item => {
          if ((_value.id == item.id) && item[nameKey]) {
            _text.push(item[nameKey])
          }
        })
      })
      setText(_text.join(', '))
    }
  }
  const $_onClose = () => {
    setModalVisible(false)
  }
  const $_onSubmit = () => {
    setModalVisible(false)
    onChange(fetchItems)
  }

  // 搜尋標籤
  const $_filterTag = React.useMemo(() => {
    if (!searchValue) {
      return items;
    }
    return items.filter(item => item.name.includes(searchValue));
  }, [searchValue, items]);

  React.useEffect(() => {
    if (defaultValue.length != 0 && value.length != 0) {
      setFetchItems([...defaultValue, ...value])
    }
  }, [defaultValue])

  React.useEffect(() => {
    if (value) {
      $_setText()
    }
  }, [value])

  // Render
  return (
    <>
      <View
        style={{
          borderRadius: 25,
          paddingHorizontal: 16
        }}
      >
        <WsBtnSelect
          style={{
          }}
          onPress={() => {
            setModalVisible(true)
            if (value && value.length > 0) {
              setFetchItems([...defaultValue, ...value])
            }
          }}
          placeholder={placeholder}
          text={text}
          icon={modelName === 'user' && 'md-people'}
          borderWidth={0.3}
          borderRadius={5}
          isError={isError}
        />
      </View>

      <WsModal
        childrenScroll={true}
        onBackButtonPress={$_onClose}
        headerLeftOnPress={$_onClose}
        footerBtnRightOnPress={$_onSubmit}
        btnLeftHidden={(!selectAllVisible && !cancelAllVisible) ? true : false}
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

        {searchVisible && (
          <WsFlex
            style={{
              paddingHorizontal: 16,
            }}
          >
            <WsState
              style={{
                flex: 1,
                marginTop: 16,
              }}
              type="search"
              placeholder={t('搜尋')}
              value={searchValue}
              onChange={setSearchValue}
            >
            </WsState>
          </WsFlex>
        )}

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
                </>
              )}
              {cancelAllVisible && (
                <TouchableOpacity
                  onPress={() => {
                    $_onClearAll(fetchItems)
                  }}>
                  <WsText color={$color.primary} size="14">
                    {t('全取消')}
                  </WsText>
                </TouchableOpacity>
              )}
            </WsFlex>
            {filterVisible && (
              <WsIconBtn
                name="bih-filter"
                underlayColor={$color.primary}
                underlayColorPressIn={$color.primary2d}
                color={$color.white}
                size={24}
                style={{
                  zIndex: 1,
                  position: 'absolute',
                  top: 8,
                  right: 16
                }}
                onPress={() => {
                  setFilterModalVisible(true)
                }}
              />
            )}
          </WsFlex>
        )}

        <WsFlex
          style={{
            padding: 16
          }}>
          <WsText
            color={$color.black}
            size={14}
            fontWeight="700"
            style={{
              flex: 1
            }}>
            {t(label)}
          </WsText>
          <WsFlex>
            <>
              <TouchableOpacity
                onPress={() => {
                  $_onSelectAll(items)
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
                testID={'全取消'}
                onPress={() => {
                  $_onClearAll(items)
                }}>
                <WsText color={$color.primary} size="14">
                  {t('全取消')}
                </WsText>
              </TouchableOpacity>
            </>
          </WsFlex>
        </WsFlex>
        {items && (
          <>
            <FlatList
              data={searchValue ? $_filterTag : items}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                return (
                  <WsNavCheck
                    key={index}
                    value={_CheckValue(item)}
                    onChange={$event => {
                      $_onPress($event, item)
                    }}
                  >
                    {t(item.name)}
                  </WsNavCheck>
                )
              }}
              ListFooterComponent={
                () => {
                  return (
                    <View
                      style={{
                        height: 100,
                        // borderWidth: 1,
                      }}
                    >
                    </View>
                  )
                }
              }
            />
          </>
        )}
      </WsModal>
    </>
  )
}

export default WsFilterCheckBox
