import React from 'react'
import {
  View,
  Pressable,
  Platform,
  TouchableOpacity
} from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsIconBtn,
  WsState,
  WsIcon,
  LlArticleCheckCard001,
  WsLoading
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import S_Processor from '@/services/app/processor'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'

const LlRelatedActBindArticleModalPicker = props => {
  const { windowWidth, windowHeight } = layouts
  // i18n
  const { t, i18n } = useTranslation()

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // Props
  const {
    value = [],
    onChange,
    placeholder = `${t('選擇')}`,
    title = t('選擇'),
    modelName,
    serviceIndexKey,
    nameKey,
    hasMeta = false,
    defaultValue = [],
    params,
    searchBarVisible
  } = props

  // State
  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState([])
  const [text, setText] = React.useState()
  const [searchValue, setSearchValue] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    let _params = {
      ...params,
      search: searchValue ? searchValue : undefined
    }
    if (searchValue && searchValue.trim() === '') {
      delete _params.search
    }
    if (!searchValue) {
      delete _params.search
    }
    return _params
  }, [currentRefreshCounter]);

  console.log(__params, '__params--');

  // Function
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
  const $_deleteOnPress = index => {
    const _value = [...fetchItems]
    _value.splice(index, 1)
    setFetchItems(_value)
    onChange(_value)
  }

  React.useEffect(() => {
    if (defaultValue.length != 0) {
      setFetchItems([...defaultValue, ...value])
    }
  }, [defaultValue])

  // Render
  return (
    <>
      {fetchItems &&
        fetchItems.length == 0 && (
          <WsBtnSelect
            onPress={() => {
              setModalVisible(true)
            }}
            placeholder={placeholder}
            text={text}
            borderWidth={0.3}
            borderRadius={5}
          />
        )}
      {fetchItems &&
        fetchItems.length > 0 && (
          fetchItems.map((_item, index) => {
            return (
              <View
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  marginBottom: 8,
                  padding: 8,
                  borderColor: $color.gray,
                }}
              >
                <WsFlex
                  justifyContent="space-between"
                >
                  <WsText
                    style={{
                      marginLeft: 16,
                      maxWidth: windowWidth * 0.675
                    }}
                    color={$color.gray}
                  >
                    {_item.article ? `${_item.article?.act_version?.name} ${_item.no_text}` : _item.last_version ? `${_item.last_version.name}` : ''}
                  </WsText>
                  <WsIconBtn
                    name={'scc-liff-close-circle'}
                    color={$color.gray}
                    onPress={() => {
                      $_deleteOnPress(index)
                    }}
                    padding={0}
                    size={24}
                  />
                </WsFlex>
              </View>
            )
          })
        )}

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
        ]}
      >

        {searchBarVisible && (
          <WsState
            style={{
              padding: 16,
            }}
            type="search"
            placeholder={t('搜尋')}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e)
              store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
            }}
          >
          </WsState>
        )}

        <WsInfiniteScroll
          hasMeta={hasMeta}
          service={Services[modelName]}
          serviceIndexKey={serviceIndexKey}
          params={__params}
          renderItem={({ item, index }) => {
            return (
              <>
                <LlArticleCheckCard001
                  keyExtractor={(item, index) => item.id + `${index}`}
                  item={item}
                  keyword={searchValue}
                  value={_CheckValue(item)}
                  onChange={($event, item) => {
                    $_onPress($event, item)
                  }}>
                </LlArticleCheckCard001>
              </>
            )
          }}
          ListFooterComponent={() => {
            return (
              <>
                <View
                  style={{
                    height: 100,
                  }}
                >
                </View>
              </>
            )
          }}
        />

      </WsModal>
    </>
  )
}

export default LlRelatedActBindArticleModalPicker
