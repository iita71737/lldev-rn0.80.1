import React, { useState, useEffect, useRef } from 'react'
import {
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsTag,
  WsInfiniteScroll,
  WsFilter,
  LlBtn002,
  LlCheckListCard001,
  WsBtn,
  WsGradientButton,
  WsIconBtn,
  WsSkeleton,
  WsPopup,
  WsEmpty,
  WsLoading,
  LlRetrainingRecordCard001,
  WsFilter002,
  WsIconBouncingArrow
} from '@/components'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import Services from '@/services/api/v1/index'
import S_Processor from '@/services/app/processor'

const WsInfiniteScrollPagination = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const {
    style,
    modelName,
    serviceIndexKey = 'index',
    params,
    renderItem,
    filterVisible = true,
    filterFields = {},
    searchVisible,
    searchLabel,
    defaultFilterValue,
    emptyTitle,
    emptyText,
    ListFooterComponent,
    ListHeaderComponent
  } = props

  // States
  const [showBouncingArrow, setShowBouncingArrow] = useState(true)

  const [modalVisible, setModalVisible] = React.useState(false)

  const [loading, setLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState()
  const [meta, setMeta] = React.useState()
  const [list, setList] = React.useState()

  const [popupActive, setPopupActive] = React.useState(false)
  const [popUpContent, setPopupContent] = React.useState(false)

  const [refreshing, setRefreshing] = useState(false);
  const queryParams = React.useMemo(() => {
    return {
      page: currentPage ? currentPage : 1,
      ...params
    }
  }, [params])

  const [filtersValue, setFiltersValue] = React.useState({ ...defaultFilterValue })
  const memoizedFiltersValue = React.useMemo(() => (
    {
      ...defaultFilterValue,
      ...filtersValue
    }
  ), [defaultFilterValue]);

  // refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await $_fetchApi({ ...queryParams, page: 1 }) // 通常刷新回第一頁
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  // FUNC
  const $_onFilterSubmit = ($event: any) => {
    setLoading(true)
    setModalVisible(false)
    $_setParams($event)
  }

  // FILTER
  const $_setParams = ($event) => {
    const _filtersValue = S_Processor.getFormattedFiltersValue(
      filterFields,
      $event
    )
    let _params = {
      ...params,
      ..._filtersValue,
      search: $event?.search
    }
    // console.log(_params,'_params222');
    $_fetchApi(_params)
  }

  // Services
  const $_fetchApi = async (params) => {
    const _ = Services[modelName]
    try {
      let _params = {
        ...params,
        page: params?.page
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
  // Function
  const $_clickPaginationPage = page => {
    const newParams = { ...queryParams, page }
    $_fetchApi(newParams)
  }

  const $_clickPaginationIcon = type => {
    let page = currentPage
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
    const _params = {
      ...params,
      page: page
    }
    $_fetchApi(_params)
  }

  // Pagination
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

  // 定義 viewability callback 的回呼函式
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const TARGET_LAST_INDEX = 15
    if (!viewableItems || viewableItems.length === 0) return
    const isLastItemVisible = viewableItems.some(item => item.index === TARGET_LAST_INDEX - 1)
    if (isLastItemVisible) {
      setShowBouncingArrow(false) // 最後一筆出現在畫面 → 隱藏箭頭
    } else {
      setShowBouncingArrow(true) // 最後一筆不在畫面 → 顯示箭頭
    }
  }).current;
  // 設定 viewabilityConfig，例如要求 50% 以上的項目可見
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,  // 例如，超過50%視為可見
  }).current;
  const handleEndReached = () => {
    setShowBouncingArrow(false)
  }

  useEffect(() => {
    $_fetchApi(queryParams)
  }, [params])

  return (
    // 250707-related module issue
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   style={{
    //     flex: 1,
    //     // backgroundColor: 'pink'
    //   }}
    //   keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // 根據你的Header高度微調
    // >
    <>
      <WsFilter002
        visible={modalVisible}
        setModalVisible={setModalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        filterTypeName={i18next.t('篩選條件')}
        fields={filterFields}
        onSubmit={$_onFilterSubmit}
        defaultFilter={memoizedFiltersValue ? memoizedFiltersValue : filtersValue}
        searchVisible={searchVisible}
        searchLabel={searchLabel}
      />

      {meta &&
        !loading ? (
        <>
          <FlatList
            style={[
              {
                marginTop: 8,
                flexGrow: 1,
              },
              style
            ]}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onViewableItemsChanged={onViewableItemsChanged}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.8} // 提前20%的地方觸發，可以自己調整
            viewabilityConfig={viewabilityConfig}
            data={list}
            keyExtractor={(item, index) => index}
            renderItem={({ item, index }) => {
              return renderItem({
                item,
                index,
                items: list
              })
            }}
            ListEmptyComponent={() => {
              return (
                <>
                  <WsEmpty emptyTitle={emptyTitle} emptyText={emptyText} />
                </>
              )
            }}
            ListFooterComponent={ListFooterComponent}
            ListHeaderComponent={ListHeaderComponent}
          />
          {showBouncingArrow && (
            <View
              style={{
                position: 'absolute',
                bottom: 120,
                alignSelf: 'center',
                height: 50,
                width: 50,
              }}
            >
              <WsIconBouncingArrow />
            </View>
          )}

          {filterVisible && (
            <WsFlex
              justifyContent="flex-end"
              style={{
                marginRight: 16,
              }}
            >
              <WsIconBtn
                testID={'WsFilter002'}
                name="bih-filter"
                underlayColor={$color.primary}
                underlayColorPressIn={$color.primary2d}
                color={$color.white}
                size={24}
                style={{
                  zIndex: 999,
                  position: 'absolute',
                  bottom: 16,
                  // borderWidth: 2
                }}
                onPress={() => {
                  setModalVisible(true)
                }}
              />
            </WsFlex>
          )}

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
        {list && meta && list.length > 0 && (
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
                textAlignVertical: 'center',
                paddingVertical: 8,
                textAlign: 'center',
                height: 40,
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
                  setCurrentPage(num); // 只有在转换成功的情况下才更新状态
                  $_clickPaginationPage(num)
                } else if (e === '') {
                  setCurrentPage(null); // 允许用户清空输入
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
        )}

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
            padding={0}
            style={{
              marginTop: 8,
              padding: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderColor: $color.primary10l,
              marginHorizontal: 16,
              paddingBottom: 16,
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
      </>
    </>
    // </KeyboardAvoidingView>
  )
}

export default WsInfiniteScrollPagination
