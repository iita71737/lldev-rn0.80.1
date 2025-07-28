import React from 'react'
import {
  View,
  Pressable,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
  Button
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
  LlGuidelineNavCheck001,
  WsPopup
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import S_Processor from '@/services/app/processor'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import moment from 'moment'

const LlRelatedGuidelineBindArticleModalPicker = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

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
    params,
    searchBarVisible,
    titleOnPress,
    defaultValue = []
  } = props

  // State
  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState([])

  const [text, setText] = React.useState()

  const [search, setSearch] = React.useState()
  const [filterFields] = React.useState({})
  const [filtersValue, setFiltersValue] = React.useState({})

  const [models, setModels] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    let _params = {
      ...params,
    }
    if (filtersValue) {
      const _filtersValue = S_Processor.getFormattedFiltersValue(
        filterFields,
        filtersValue
      )
      _params = {
        ...params,
        ..._filtersValue,
      }
    }
    delete _params.guideline_id  //關聯內規流程所需
    return _params
  }, [filtersValue, params]);

  // Function
  const $_onSubmit = () => {
    setModalVisible(false)
    onChange(fetchItems)
  }
  const $_onClose = () => {
    console.log('$_onClose');
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
      setFetchItems(_fetchItems)
    } else {
      if (tarIndex < 0) {
        _fetchItems.push(item)
        const removeDescendantsOfCandidate = (candidate, selectedItems) => {
          return selectedItems.filter(item => {
            return item.sequence === candidate || !item.sequence.startsWith(candidate + '-');
          });
        };
        const _filteredItems = removeDescendantsOfCandidate(item.sequence, _fetchItems);
        setFetchItems(_filteredItems)
      }
    }
  }

  // checkbox
  const $_checkValue = item => {
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

  // 檢查子層
  const $_disabledCheck = (candidate, selectedItems, allItems) => {
    // 如果 candidate 沒有父層，就不是子層
    if (!candidate.parent_article_version_id) {
      return false;
    }
    // 檢查 candidate 的 immediate parent 是否在 selectedItems 中
    if (selectedItems.some(selected => selected.id === candidate.parent_article_version_id)) {
      return true;
    }
    // 找出 candidate 的父項目
    const parent = allItems.find(item => item.id === candidate.parent_article_version_id);
    if (!parent) {
      return false;
    }
    // 遞迴檢查父項目是否是 selectedItems 的後代
    return $_disabledCheck(parent, selectedItems, allItems);
  }

  // helper
  const $_checkVersion = (item) => {
    if (item?.bind_version === 'last_ver') {
      return `(${t('Latest')})`
    }
    else {
      return `(${moment(item.announce_at).format('YYYY-MM-DD')})`
    }
  }

  React.useEffect(() => {
    if (defaultValue.length != 0) {
      setFetchItems([...defaultValue, ...value])
    }
  }, [defaultValue])

  React.useEffect(() => {
    if (JSON.stringify(fetchItems) !== JSON.stringify(value)) {
      setFetchItems(value);
    }
  }, [value])

  // Render
  return (
    <>
      <WsBtnSelect
        onPress={() => {
          setModalVisible(true)
        }}
        placeholder={placeholder}
        text={text}
        borderWidth={0.3}
        borderRadius={5}
        style={{
          marginBottom: 4
        }}
      />
      {fetchItems &&
        fetchItems.length > 0 ? (
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
                    maxWidth: width * 0.675
                  }}
                  color={$color.gray}
                >
                  {`${_item.name}  ${$_checkVersion(_item)}`}
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
      ) : (
        <WsText>{`(${t('尚未選取內規或層級條文')})`}</WsText>
      )}

      <WsModal
        childrenScroll={true}
        headerLeftOnPress={$_onClose}
        footerBtnLeftOnPress={$_onClose}
        footerBtnRightOnPress={$_onSubmit}
        footerBtnLeftText={t('取消')}
        footerBtnRightText={t('確定')}
        visible={modalVisible}
        title={t('選擇層級條文')}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null
        ]}>
        {searchBarVisible && (
          <WsState
            style={{
              padding: 16,
            }}
            type="search"
            placeholder={t('搜尋')}
            value={search}
            onChange={e => {
              setSearch(e)
              const _params = {
                search: e
              }
              setFiltersValue(_params)
            }}
          >
          </WsState>
        )}

        <WsInfiniteScroll
          style={{
            maxHeight: height*0.65,
            // borderWidth:3,
          }}
          hasMeta={hasMeta}
          service={Services[modelName]}
          serviceIndexKey={serviceIndexKey}
          params={__params}
          ListHeaderComponent={(models) => {
            setModels(models)
          }}
          renderItem={({ item, index }) => {
            return (
              <>
                <LlGuidelineNavCheck001
                  item={item}
                  disabled={$_disabledCheck(item, fetchItems, models)}
                  style={{
                    marginLeft: (item?.sequence?.split('-').length - 1) * 16,
                  }}
                  value={$_checkValue(item)}
                  onChange={$event => {
                    $_onPress($event, item)
                  }}
                >
                  <WsText
                    color={$_disabledCheck(item, fetchItems, models) ? $color.white2d : $color.black}
                    style={{
                      maxWidth: (width * 0.8) - ((item?.sequence?.split('-').length - 1) * 16)
                    }}
                  >
                    {item.name ? item.name : item.article ? `${item.article?.act_version?.name} ${item.no_text}` : 'unknown'}
                  </WsText>
                </LlGuidelineNavCheck001>
              </>
            )
          }}
        />
      </WsModal>
    </>
  )
}

export default LlRelatedGuidelineBindArticleModalPicker

