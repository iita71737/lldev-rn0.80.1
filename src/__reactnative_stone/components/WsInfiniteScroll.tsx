import React, { useCallback, useMemo, useState, useRef } from 'react'
import {
  FlatList,
  Animated,
  View,
  Platform,
  Alert,
  Dimensions
} from 'react-native'
import {
  WsEmpty,
  WsText,
  WsLoading,
  WsSkeleton,
  WsIcon,
  WsIconBouncingArrow
} from '@/components'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import axios from 'axios'

import {
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const WsInfiniteScroll = React.forwardRef((props, ref) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Prop
  const {
    mode = 'page',
    limit,
    params,
    pageKey = 'page',
    lastPageKey = 'last_page',
    currentPageKey = 'current_page',
    service,
    hasMeta = true,
    getAll = hasMeta ? false : true,
    getResData,
    renderItem,
    onEndReachedThreshold = .8,
    initialNumToRender = 15,
    ListHeaderComponent,
    initialScrollIndex,
    ListFooterComponent,
    stickyHeaderIndices,
    padding = 0,
    serviceIndexKey = 'index',
    onRefresh,
    emptyTitle,
    emptyText,
    onItemsFetch = () => { },
    style,
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    contentContainerStyle,
    numColumns = 1,
    fetchUrl,
    tabMode = 'default',
    onLayout,
    pagingEnabled,
    nestedScrollEnabled = true,
    onIndexChange,
    showLoading = true,
    showBottomText = true,
    scrollEnabled = true,
    keyboardShouldPersistTaps,
    scrollToTargetIndex,
    listBottomPaddingVisible = true,
    hasFooterBtn = false,
    shouldHandleScroll = true,
  } = props

  const flatListRef = React.useRef(null);
  const isFetchedRef = useRef<boolean>(false) // 標記是否成功抓完資料

  // Ref Methods
  React.useImperativeHandle(ref, () => ({
    deleteItem: (item) => {
      $_onDeleteItem(item)
    },
    reset: () => {
      $_reset()
    },
    add: (item) => {
      $_add(item)
    }
  }));

  // REF
  const isFetching = React.useRef(false)
  const controllerRef = React.useRef(null);
  const prevOffset = useRef(0);

  // State
  const [loading, setLoading] = React.useState(true)
  const [models, setModels] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [lastPage, setLastPage] = React.useState(100)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isFinalRound, setIsFinalRound] = React.useState(false)
  const [isReseting, setIsReseting] = React.useState(false)
  const [isReady, setIsReady] = React.useState(false)
  const [itemHeight, setItemHeight] = React.useState(0)
  const [hasError, setHasError] = React.useState(false)

  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const hasCalledEndReached = useRef(false);
  const [bottomIconVisible, setBottomIconVisible] = React.useState(true)

  // Methods
  const $_fetchModels = async () => {
    $_fetchModelsAction()
  }

  const $_add = (item) => {
    setModels([item, ...models])
  }

  const $_fetchModelsAction = async () => {
    const token = await S_Keychain.getToken()
    if (!token) {
      return
    }
    if (hasError) {
      return
    }
    if (hasMeta && lastPage <= currentPage && mode == 'page') {
      isFetching.current = false
      return
    } else if (isFinalRound) {
      return
    }
    if (isFetching.current) {
      return
    }
    isFetching.current = true
    let _params = {
      ...params,
      token: token,
    }
    if (mode == 'page') {
      _params[pageKey] = currentPage + 1
      if (limit) {
        _params.limit = limit
      }
    }
    try {
      let res
      setLoading(true)
      if (fetchUrl) {
        const urlRes = await axios.get(fetchUrl, {
          params: _params,
          signal: controllerRef.current.signal
        })
        res = urlRes.data
      } else {
        res = await service[serviceIndexKey]({
          params: _params,
          signal: controllerRef.current.signal
        })
      }

      onItemsFetch(res.data)
      let fetchedModels
      if (getResData) {
        fetchedModels = getResData(res)
      } else {
        fetchedModels = res.data
      }
      if (getAll) {
        setLastPage(currentPage)
      } else if (mode == 'page') {
        if (hasMeta) {
          if (res.meta && res.meta[lastPageKey] !== undefined && res.meta[currentPageKey] !== undefined) {
            setLastPage(res.meta[lastPageKey])
            setCurrentPage(parseInt(res.meta[currentPageKey]))
          } else {
            console.error('缺少 meta 資料：', res)
            if (res.message === 'Too Many Attempts.')
              Alert.alert(t('請求次數過多，請稍候再試'))
          }
        } else {
          setCurrentPage(currentPage + 1)
          if (fetchedModels.length < limit) {
            setIsFinalRound(true)
          }
        }
      }
      const _models = []
      fetchedModels.forEach(_model => {
        const target = models.find(e => {
          return e.id == _model.id
        })
        if (!target) {
          _models.push(_model)
        }
      })
      setModels([...models, ..._models])
      isFetchedRef.current = true // 資料抓完設為 true
    } catch (error) {
      console.error(error);
      setHasError(true)
    } finally {
      isFetching.current = false
      setIsRefreshing(false)
      setIsReseting(false)
      setLoading(false)
    }
  }

  const $_reset = () => {
    setCurrentPage(0)
    setLastPage(1)
    setModels([])
    setIsReseting(true)
    setHasError(false)

    setBottomIconVisible(true)
    setCurrentPage(0)
  }

  const $_onRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
    setIsRefreshing(true)
  }

  const $_onEndReached = () => {
    if (!isReady) {
      return
    }
    if (getAll) {
      return
    }
    $_fetchModels()
  }

  const $_onChangeItem = ($event, index, item) => {
    const _models = [
      ...models
    ]
    const _modelIndex = models.findIndex(e => {
      return e.id == item.id
    })
    _models[_modelIndex] = {
      ..._models[_modelIndex],
      ...$event
    }
    setModels(_models)
  }

  const $_onScroll = ($event) => {
    const currentOffset = $event.nativeEvent.contentOffset.y;
    if (currentOffset < prevOffset.current) {
      // 使用者往上滾
      const delta = prevOffset.current - currentOffset;
      // console.log(shouldHandleScroll,'shouldHandleScroll');
      // console.log(delta, 'delta');
      // 如果前一次滾動值大於當前值，表示向上滾動，且超過閥值
      if (delta > 100) {
        // issues
        // setBottomIconVisible(true)
        // setCurrentPage(0)
      } else if (delta > 0 && hasFooterBtn) {
        // issues
        // 相關文件issues
        // setBottomIconVisible(true)
        // setCurrentPage(0)
      } else if (currentPage == lastPage) {
        // issues
        // setBottomIconVisible(true)
        // setCurrentPage(0)
      }
    } else if (currentOffset > prevOffset.current) {
      if (currentOffset + containerHeight >= contentHeight - 50) {
        // 防止重複觸發
        if (!hasCalledEndReached.current) {
          hasCalledEndReached.current = true;
          $_onEndReached();
        }
      }
    }
    // 更新 prevOffset
    prevOffset.current = currentOffset

    if (onScroll) {
      onScroll($event)
    } else {
      $_onEndReached()
    }
  }

  const $_onMomentumScrollEnd = ($event) => {
    if (pagingEnabled && onIndexChange && itemHeight) {
      const { contentOffset } = $event.nativeEvent;
      const _index = Math.floor(contentOffset.y / itemHeight); // Adjust this based on your item height
      onIndexChange(_index);
    }
    if (onMomentumScrollEnd) {
      onMomentumScrollEnd($event)
    }
  }

  const $_onDeleteItem = (item) => {
    const _models = [
      ...models
    ]
    const _modelIndex = models.findIndex(e => {
      return e.id == item.id
    })
    _models.splice(_modelIndex, 1)
    setModels(_models)
  }
  const $_onLayout = ($event) => {
    setContainerHeight($event.nativeEvent.layout.height);
    if (pagingEnabled) {
      setItemHeight($event.nativeEvent.layout.height)
    }
    if (onLayout) {
      onLayout($event)
    }
  }
  const $_handleOnContentSizeChange = (w, h) => {
    setContentHeight(height);
    // 每次內容更新後，重置 hasCalledEndReached（例如用於重新加載資料時）
    hasCalledEndReached.current = false;
  };

  const modelsRef = useRef(models);
  React.useEffect(() => {
    modelsRef.current = models;
  }, [models]);

  // 定義 viewability callback 的回呼函式
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!modelsRef.current || modelsRef.current.length === 0) return;
    const lastIndex = modelsRef.current.length - 1;
    // 檢查是否有 viewableItems 中的 item.index === lastIndex
    if (viewableItems.some(item => item.index === lastIndex) && (currentPage == lastPage)) {
      // console.log("使用者已經看到最後一筆資料");
      setBottomIconVisible(false)
    }
  }).current;

  // 設定 viewabilityConfig，例如要求 50% 以上的項目可見
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,  // 例如，超過50%視為可見
  }).current;

  // Effect
  React.useEffect(() => {
    if (isRefreshing) {
      $_reset()
    }
  }, [isRefreshing])

  React.useEffect(() => {
    if (!isReady) {
      return
    }
    $_reset()
  }, [params])

  React.useEffect(() => {
    if (!isReady) {
      return
    }
    if (!isReseting) {
      return
    }
    $_fetchModels()
  }, [isReseting])

  React.useEffect(() => {
    // first
    const timeout = setTimeout(() => {
      setIsReady(true)
      $_fetchModels()
    }, 100)
    return () => clearTimeout(timeout);
  }, [])

  let _Tab = FlatList
  if (tabMode == 'animated') {
    _Tab = Animated.FlatList
  } else if (tabMode == 'tab') {
    // _Tab = Tabs.FlatList
  } else if (tabMode == 'bottom-sheet') {
    _Tab = BottomSheetFlatList
  }

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      controllerRef.current = controller;
      isFetchedRef.current = false
      $_fetchModels() // 250725-testFetch-when-goBack

      return () => {
        if (!isFetchedRef.current) {
          controller.abort()
          console.log('Aborted')
        } else {
          console.log('No need to abort')
        }
      };
    }, [])
  );

  React.useEffect(() => {
    if (scrollToTargetIndex !== undefined &&
      flatListRef.current &&
      models &&
      models.length > 0 &&
      models.length >= scrollToTargetIndex) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index: scrollToTargetIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          console.warn('scrollToIndex error:', error);
        }
      }, 500);
    }
  }, [scrollToTargetIndex, models]);

  const HeaderWrapper = React.memo(({ models }) => {
    if (scrollToTargetIndex !== undefined && models.length === 0) {
      return null;
    }
    return ListHeaderComponent ? ListHeaderComponent(models) : null;
  });

  const memoizedHeader = useMemo(() => {
    return <HeaderWrapper models={models} />
  }, [models]);

  // Render
  return (
    <>
      <_Tab
        testID="WsInfiniteScroll"
        onLayout={$_onLayout}
        onContentSizeChange={$_handleOnContentSizeChange}
        onScroll={shouldHandleScroll == false ? undefined : $_onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        pagingEnabled={pagingEnabled}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={nestedScrollEnabled}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        ref={flatListRef}
        initialScrollIndex={initialScrollIndex}
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={16}
        numColumns={numColumns}
        onMomentumScrollEnd={$_onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        keyExtractor={(item, index) => item.id + `${index}`}
        data={models}
        initialNumToRender={models.length}
        renderItem={({ item, index }) => {
          if (scrollToTargetIndex !== undefined && models.length == 0) {
            return (
              <></>
            )
          } else {
            return renderItem({
              item,
              index,
              items: models,
              onChangeItem: ($event) => {
                $_onChangeItem($event, index, item)
              },
              onDeleteItem: ($event) => {
                $_onDeleteItem($event)
              }
            })
          }
        }}
        onRefresh={$_onRefresh}
        refreshing={isRefreshing}
        ListHeaderComponent={memoizedHeader}
        stickyHeaderIndices={stickyHeaderIndices}
        onEndReached={$_onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        style={[
          {
            padding: padding,
          },
          style
        ]}
        ListFooterComponent={
          <>
            {
              (currentPage == lastPage) &&
              showBottomText &&
              models.length != 0 &&
              getAll &&
              (
                <View
                  style={{
                    padding: 12,
                    paddingBottom: listBottomPaddingVisible ? 100 : undefined,
                    alignItems: "center",
                  }}
                >
                </View>
              )}
            {
              (currentPage != lastPage) &&
              showLoading &&
              loading &&
              hasMeta &&
              (
                <View
                  style={{
                    transform: [{ rotate: '180deg' }],
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <WsLoading size={30}></WsLoading>
                </View>
              )}
            {ListFooterComponent && <ListFooterComponent></ListFooterComponent>}
          </>
        }
        ListEmptyComponent={() => {
          return (
            <>
              {
                (!loading &&
                  !isFetching.current &&
                  !isReseting &&
                  isReady &&
                  models &&
                  models.length === 0) ?
                  (
                    <WsEmpty emptyTitle={emptyTitle} emptyText={emptyText} />
                  ) : hasMeta === false && (
                    <WsLoading size={30}></WsLoading>
                  )}
            </>
          )
        }}
      />
      {models &&
        models.length > 0 &&
        bottomIconVisible &&
        (currentPage != lastPage) &&
        (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              alignSelf: 'center',
              height: 50,
              width: 50,
              marginBottom: hasFooterBtn ? 100 : undefined,
              // borderWidth: 1,
            }}
          >
            <WsIconBouncingArrow></WsIconBouncingArrow>
          </View>
        )}
    </>
  )
});

export default React.memo(WsInfiniteScroll)