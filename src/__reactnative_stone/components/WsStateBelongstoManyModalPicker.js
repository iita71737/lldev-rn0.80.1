import React, { useState } from 'react'
import {
  Pressable,
  Platform,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  TextInput
} from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsState,
  WsFilter002,
  WsIconBtn,
  WsLoading,
  WsPaddingContainer,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import S_Processor from '@/services/app/processor'

const WsStateBelongstoManyModalPicker = props => {
  const { windowWidth, windowHeight } = layouts
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    value = [],
    onChange = () => { },
    isError,
    placeholder = `${t('選擇')}`,
    placeholderIcon,
    selectAllVisible = true,
    cancelAllVisible = true,
    searchBarVisible = false,
    btnLeftHidden,
    title = t(''),
    modelName,
    serviceIndexKey = 'index',
    nameKey,
    nameKey2,
    hasMeta = true,
    defaultValue = [],
    params = {},
    testID,
    formatNameKey2 = 'YYYY-MM-DD',
    filterVisible = false,
    _filterFields,
    showListBelow = false,
    pagination = false,
    customizedNameKey = null
  } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState()
  const [meta, setMeta] = React.useState()
  const [list, setList] = React.useState()

  const [filterModalVisible, setFilterModalVisible] = React.useState(false)
  const [filterFields] = React.useState(_filterFields ? _filterFields : {})
  const [filtersValue, setFiltersValue] = React.useState({})

  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState([])
  const [text, setText] = React.useState()
  const [search, setSearch] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    let _params = {
      ...params,
    }
    if (Object.keys(filtersValue).length) {
      const _filtersValue = S_Processor.getFormattedFiltersValue(
        filterFields,
        filtersValue
      )
      _params = {
        ..._params,
        ..._filtersValue
      };
    }
    return _params
  }, [filtersValue]);


  // Function
  const $_onFilterSubmit = $event => {
    if (search) {
      setSearch($event.search)
    }
    setFiltersValue($event)
    setFilterModalVisible(false)
  }

  const $_setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        value.forEach(item => {
          if (_value.id == item.id) {
            _text.push(item[nameKey])
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
  // 刪除
  const $_deleteOnPress = (index) => {
    const _value = [...value]
    _value.splice(index, 1)
    setFetchItems(_value)
    onChange(_value)
  }

  // Services
  const $_fetchApi = async (page) => {
    const _ = Services[modelName]
    try {
      let _params = {
        ...__params,
        page: page
      }
      res = await _[serviceIndexKey]({
        params: _params,
      })
      setList(res.data)
      setMeta(res.meta)
      setCurrentPage(res.meta.current_page)
      setLoading(false)
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }
  const $_renderPagination = (totalPages, currentPage) => {
    // 當總頁數不超過 6 頁時，直接回傳所有頁碼
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // 固定的前後區間
    const firstSet = [1, 2, 3];
    const lastSet = [totalPages - 2, totalPages - 1, totalPages];
    // 定義中間要顯示的頁碼區間
    let middleRange = [];
    // 當目前頁碼位於前面(<=3)或後面(>= totalPages-2)時，僅額外加入當前相關頁碼
    if (currentPage === 3) {
      middleRange = [4];
    } else if (currentPage === totalPages - 2) {
      middleRange = [totalPages - 3];
    } else if (currentPage > 3 && currentPage < totalPages - 2) {
      // 常態狀況：顯示 currentPage 前後各一頁
      const start = Math.max(4, currentPage - 1);
      const end = Math.min(totalPages - 3, currentPage + 1);
      for (let i = start; i <= end; i++) {
        middleRange.push(i);
      }
    }
    // 如果不符合上述條件，middleRange 可能為空
    // 合併：先加入前面固定部分，然後插入 ellipsis (如果需要) ，再加入中間區間，再判斷中間與最後區間間是否需要省略號
    const pagination = [];
    // 加入前區間
    pagination.push(...firstSet);
    // 如果中間區域存在，判斷與前區間最後一項是否連續
    if (middleRange.length > 0) {
      if (middleRange[0] - firstSet[firstSet.length - 1] > 1) {
        pagination.push("...");
      }
      pagination.push(...middleRange);
    } else {
      // 若沒有中間區域，直接判斷前區與後區的差距
      if (lastSet[0] - firstSet[firstSet.length - 1] > 1) {
        pagination.push("...");
      }
    }
    // 判斷最後區間與（中間區或前區）是否連續
    const lastVal = (middleRange.length > 0 ? middleRange[middleRange.length - 1] : firstSet[firstSet.length - 1]);
    if (lastSet[0] - lastVal > 1) {
      pagination.push("...");
    }
    pagination.push(...lastSet);
    return pagination;
  }
  const $_clickPaginationPage = page => {
    $_fetchApi(page)
  }
  const $_clickPaginationIcon = type => {
    let page = params.page
    switch (type) {
      case 'ToFirstPage':
        page = 1
        break
      case 'Back':
        page = page - 1
        break
      case 'Forward':
        page = page + 1
        break
      case 'ToFinalPage':
        page = meta.last_page
        break
      default:
    }
    $_fetchApi(page)
  }

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

  React.useEffect(() => {
    if (pagination) {
      $_fetchApi()
    }
  }, [params])

  // Render
  return (
    <>
      <WsBtnSelect
        style={{
        }}
        testID={testID}
        onPress={() => {
          setModalVisible(true)
          if (value && value.length > 0) {
            setFetchItems([...defaultValue, ...value])
          }
        }}
        placeholder={placeholder}
        badge={value && value.length ? value.length : null}
        text={text}
        icon={modelName === 'user' && 'md-people'}
        borderWidth={0.3}
        borderRadius={5}
        isError={isError}
      />

      {showListBelow &&
        value &&
        value.length > 0 && (
          value.map((_item, index) => {
            return (
              <View
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: 4,
                  padding: 8,
                  borderColor: $color.gray
                }}
              >
                <WsFlex
                  justifyContent="space-between"
                >
                  <WsText
                    style={{
                      marginLeft: 8,
                      maxWidth: width * 0.775,
                    }}
                    color={$color.gray}
                  >
                    {_item.name ? _item.name : 'unknown'}
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
            : null,
        ]}>
        <View
          style={{
            flex: 1
          }}
        >
          <WsFilter002
            visible={filterModalVisible}
            setModalVisible={setFilterModalVisible}
            onClose={() => {
              setFilterModalVisible(false)
            }}
            filterTypeName={t('篩選條件')}
            fields={filterFields}
            searchVisible={false}
            onSubmit={$_onFilterSubmit}
          />
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

          {pagination === false && (
            <WsInfiniteScroll
              hasMeta={hasMeta}
              service={Services[modelName]}
              serviceIndexKey={serviceIndexKey}
              params={__params}
              hasFooterBtn={true}
              renderItem={({ item, index }) => {
                return (
                  <WsNavCheck
                    testID={item.name}
                    value={_CheckValue(item)}
                    onChange={$event => {
                      $_onPress($event, item)
                    }}
                    textRight={nameKey2 ? moment(t(item[nameKey2])).format(formatNameKey2) : t(item[nameKey2])}
                    defaultRightWidthTimes={0.3}
                    textRightWidthTimes={0.25}
                    defaultLeftWidthTime={0.6}
                    textLeftWidthTimes={0.7}
                  >
                    {item.name && !customizedNameKey ? item.name : item.content ? item.content : ''}
                    {customizedNameKey === 'userAndEmail' ?
                      `${item?.[nameKey]} ( ${item?.['email']} )` :
                      ''
                    }
                  </WsNavCheck>
                )
              }}
              ListFooterComponent={() => {
                return (
                  <>
                    <View
                      style={{
                        height: 100,
                        // borderWidth: 2,
                      }}
                    >
                    </View>
                  </>

                )
              }}
            />
          )}

          {pagination && (
            <>
              {meta ? !loading && (
                <>
                  <FlatList
                    style={{
                      maxHeight: height * 0.425
                    }}
                    data={list}
                    keyExtractor={(item, index) => index}
                    renderItem={({ item, index }) => {
                      return (
                        <WsNavCheck
                          testID={item.name}
                          value={_CheckValue(item)}
                          onChange={$event => {
                            $_onPress($event, item)
                          }}
                          textRight={nameKey2 ? moment(t(item[nameKey2])).format(formatNameKey2) : t(item[nameKey2])}
                          defaultRightWidthTimes={0.3}
                          textRightWidthTimes={0.25}
                          defaultLeftWidthTime={0.6}
                          textLeftWidthTimes={0.5}
                        >
                          {item.name ? item.name : item.content ? item.content : ''}
                        </WsNavCheck>
                      )
                    }}
                  />
                </>
              ) : (
                <>
                  {loading ? (
                    <View
                      style={{
                        transform: [{ rotate: '180deg' }],
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <WsLoading size={30}></WsLoading>
                    </View>
                  ) : (
                    <View
                      style={{
                        padding: 12,
                        alignItems: "center"
                      }}
                    >
                    </View>
                  )
                  }
                </>
              )}
              {/* pagination */}
              <>
                <WsPaddingContainer
                  padding={0}
                  style={{
                    marginHorizontal: 16,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 8,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    borderTopWidth: 1,
                    borderColor: $color.primary10l,
                  }}>
                  <WsText>{`${t('前往頁數')}`}</WsText>
                  <TextInput
                    style={{
                      textAlign: 'center',
                      height: 36,
                      width: 60,
                      margin: 12,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: $color.white5d,
                      color: $color.black
                    }}
                    onChangeText={e => {
                      const num = parseInt(e, 10); // 将字符串转换为数字
                      if (!isNaN(num)) {
                        setPageNumber(num); // 只有在转换成功的情况下才更新状态
                        $_clickPaginationPage(num)
                      } else if (e === '') {
                        setPageNumber(null); // 允许用户清空输入
                      }
                    }}
                    value={currentPage != undefined ? currentPage.toString() : null}
                    keyboardType="numeric"
                  />
                  {meta &&
                    meta.last_page && (
                      <WsText>
                        {t('共{number}頁', { number: meta.last_page })}
                      </WsText>
                    )}

                  <WsGradientButton
                    style={{
                      flex: 1
                    }}
                    borderRadius={30}
                    onPress={() => {
                      $_clickPaginationPage(currentPage)
                    }}>
                    <WsText color={$color.white}>{t('前往')}</WsText>
                  </WsGradientButton>
                </WsPaddingContainer>

                {list && meta && list.length > 0 && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      marginHorizontal: 16,
                      padding: 0,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderColor: $color.primary10l,
                      // borderWidth: 1,
                    }}>
                    <WsFlex>
                      <WsText>
                        {t('第{fromNum}-{toNum}筆 共{totalNum}筆', { totalNum: meta.total, fromNum: meta.from ? meta.from : 0, toNum: list + meta.from ? list.length + meta.from - 1 : '' })}
                      </WsText>
                    </WsFlex>
                  </WsPaddingContainer>
                )}

                {list && meta && list.length > 0 && (
                  <WsPaddingContainer
                    style={{
                      marginTop: 8,
                      marginHorizontal: 16,
                      padding: 0,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderColor: $color.primary10l,
                      // borderWidth: 1,
                    }}>
                    <WsFlex
                      justifyContent={'space-between'}
                      style={{
                        // borderWidth: 1
                      }}
                    >
                      <>
                        <WsFlex
                          justifyContent={'space-between'}
                          style={{
                            flex: 1,
                            // borderWidth: 1
                          }}
                        >
                          <WsIconBtn
                            style={{
                            }}
                            padding={0}
                            disabled={meta.current_page === 1 ? true : false}
                            color={meta.current_page === 1 ? $color.gray : $color.primary}
                            name="ws-outline-chevron-back-start"
                            size={24}
                            onPress={() => {
                              $_clickPaginationIcon('ToFirstPage')
                            }}
                          />
                          <WsIconBtn
                            style={{
                            }}
                            padding={0}
                            disabled={meta.current_page === 1 ? true : false}
                            color={meta.current_page === 1 ? $color.gray : $color.primary}
                            name="ws-outline-chevron-back"
                            size={24}
                            onPress={() => {
                              $_clickPaginationIcon('Back')
                            }}
                          />
                          {$_renderPagination(meta.last_page, currentPage).map((page, index) => {
                            return (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  index != 0 ?
                                    {
                                      marginLeft: 16
                                    }
                                    : null
                                ]}
                                onPress={() => {
                                  $_clickPaginationPage(page)
                                }}>
                                <WsText
                                  color={
                                    page == meta.current_page ? $color.primary : $color.gray
                                  }>
                                  {page}
                                </WsText>
                              </TouchableOpacity>
                            )
                          })}
                          <WsIconBtn
                            style={{
                            }}
                            padding={0}
                            disabled={meta.current_page === meta.last_page ? true : false}
                            color={
                              meta.current_page === meta.last_page
                                ? $color.gray
                                : $color.primary
                            }
                            name="ws-outline-chevron-forward"
                            size={24}
                            onPress={() => {
                              $_clickPaginationIcon('Forward')
                            }}
                          />
                          <WsIconBtn
                            style={{
                            }}
                            padding={0}
                            disabled={meta.current_page === meta.last_page ? true : false}
                            color={
                              meta.current_page === meta.last_page
                                ? $color.gray
                                : $color.primary
                            }
                            name="ws-outline-chevron-forward-end"
                            size={24}
                            onPress={() => {
                              $_clickPaginationIcon('ToFinalPage')
                            }}
                          />
                        </WsFlex>
                      </>
                    </WsFlex>
                  </WsPaddingContainer>
                )}
                <View
                  style={{
                    height: 50
                  }}
                ></View>
              </>
            </>
          )}

        </View>
      </WsModal>
    </>
  )
}

export default WsStateBelongstoManyModalPicker
