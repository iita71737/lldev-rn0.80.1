import React from 'react'
import { WsPage, WsTabView } from '@/components'
import ActListing from '@/sections/Act/ActListing'
import ActCollection from '@/sections/Act/ActCollection'
import ActChangeReport from '@/sections/Act/ActChangeReport'
import ActLibrary from '@/sections/Act/ActLibrary'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setIdleCounter } from '@/store/data'
import S_Act from '@/services/api/v1/act'

const Act = ({ route, navigation }) => {
  const { t } = useTranslation()

  const reRouteTabIndex = route.params?.tabIndex
  const _alliance = route?.params?.alliance

  // Redux
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const factory = useSelector(state => state.data.currentFactory)

  // States
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState()
  const [searchValue, setSearchValue] = React.useState('')
  const [searchKeyword, setSearchKeyword] = React.useState('')
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const [searchSuggestionLoading, setSearchSuggestionLoading] = React.useState(false)
  const [searchSuggestions, setSearchSuggestions] = React.useState([])
  const _blurTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Function
  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'listing',
        label: t('最新上線'),
        view: ActListing,
        props: {
          navigation: navigation,
          _alliance: _alliance,
          searchValue: searchKeyword
        }
      },
      {
        value: 'collection',
        label: t('我的收藏'),
        view: ActCollection,
        props: {
          navigation: navigation,
          currentTabIndex: tabIndex,
          _alliance: _alliance,
          searchValue: searchKeyword
        }
      },
      {
        value: 'library',
        label: t('法規圖書館'),
        view: ActLibrary,
        props: {
          navigation: navigation,
          currentTabIndex: tabIndex,
          _alliance: _alliance,
          searchValue: searchKeyword
        }
      },
      {
        value: 'change_report',
        label: t('法規變更報表'),
        view: ActChangeReport,
        props: {
          navigation: navigation,
          currentTabIndex: tabIndex,
          _alliance: _alliance,
          searchValue: searchKeyword
        }
      }
    ])
  }

  React.useEffect(() => {
    $_setTabItems()
  }, [factory, systemClasses, tabIndex, _alliance, searchKeyword])

  React.useEffect(() => {
    if (reRouteTabIndex != undefined) {
      settabIndex(reRouteTabIndex)
    }
  }, [reRouteTabIndex])

  React.useEffect(() => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  }, [tabIndex])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  React.useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      settabIndex(0)
      setIsSearchFocused(false)
      if (_blurTimerRef.current) {
        clearTimeout(_blurTimerRef.current)
      }
    })
    return unsub
  }, [navigation])

  React.useEffect(() => {
    const _timer = setTimeout(() => {
      setSearchKeyword((searchValue || '').trim())
    }, 250)
    return () => clearTimeout(_timer)
  }, [searchValue])

  React.useEffect(() => {
    if (!isSearchFocused || !searchKeyword) {
      setSearchSuggestions([])
      setSearchSuggestionLoading(false)
      return
    }

    let _active = true
    const $_loadSearchSuggestions = async () => {
      setSearchSuggestionLoading(true)
      try {
        const _res = await S_Act.index({
          params: {
            search: searchKeyword,
            order_by: 'announce_at',
            order_way: 'desc',
            time_field: 'announce_at',
            page: 1
          }
        })
        if (!_active) return
        const _list = Array.isArray(_res?.data) ? _res.data : []
        const _dedupe = new Set()
        const _items = _list
          .map(item => {
            const _name = item?.last_version?.name || item?.name || ''
            if (!_name || _dedupe.has(item?.id)) return null
            _dedupe.add(item?.id)
            return {
              id: item?.id,
              label: _name,
              subtitle: item?.act_status?.name || ''
            }
          })
          .filter(Boolean)
          .slice(0, 6)
        setSearchSuggestions(_items)
      } finally {
        if (_active) {
          setSearchSuggestionLoading(false)
        }
      }
    }
    $_loadSearchSuggestions()
    return () => {
      _active = false
    }
  }, [searchKeyword, isSearchFocused])

  return (
    <WsPage
      mode="search"
      title={t('法規')}
      iconLeft="md-chevron-left"
      leftOnPress={() => navigation.goBack()}
      iconRight="ws-outline-search"
      showRightBtn={true}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      showLeftBtn={true}
      searchTriggerOnRight={true}
      showSearchSuggestions={isSearchFocused}
      searchSuggestionLoading={searchSuggestionLoading}
      searchSuggestions={searchSuggestions}
      onSearchFocus={() => {
        if (_blurTimerRef.current) {
          clearTimeout(_blurTimerRef.current)
        }
        setIsSearchFocused(true)
      }}
      onSearchBlur={() => {
        _blurTimerRef.current = setTimeout(() => {
          setIsSearchFocused(false)
        }, 150)
      }}
      onPressSearchSuggestion={item => {
        if (_blurTimerRef.current) {
          clearTimeout(_blurTimerRef.current)
        }
        const _nextKeyword = item?.label || ''
        setSearchValue(_nextKeyword)
        setSearchKeyword(_nextKeyword)
        setIsSearchFocused(false)
      }}
    >
      {tabItems && (
        <WsTabView
          index={tabIndex}
          setIndex={settabIndex}
          items={tabItems}
          scrollEnabled={true}
          isAutoWidth={true}
          tabLabelFullText={true}
          pointerVisible={true}
        />
      )}
    </WsPage>
  )
}

export default Act
