import React, { useCallback } from 'react'
import { Pressable, ScrollView, Alert } from 'react-native'
import { useSelector } from 'react-redux'
import {
  WsToggleBtn,
  WsText,
  WsLoading,
  WsPaddingContainer,
  WsState,
  WsInfiniteScrollPagination,
  LlContentTextCard001
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_Locale from '@/services/api/v1/locale'
import S_ContentText from '@/services/api/v1/content_text'
import S_User from '@/services/api/v1/user'
import axios from 'axios'
import config from '@/__config'
import G_i18n from '@/__reactnative_stone/global/i18n'
import store from '@/store'
import {
  setCurrentUser
} from '@/store/data'
import { withNamespaces } from 'react-i18next';
import i18next from 'i18next';
import $color from '@/__reactnative_stone/global/color'
import { useFocusEffect } from '@react-navigation/native'

const SettingTranslation = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentLocales = useSelector(state => state.data.currentLocales)

  // State
  const [loading, setLoading] = React.useState(false)
  // field
  const [filterFields, setFilterFields] = React.useState({
    locale: {
      type: 'belongsto',
      label: i18next.t('語言'),
      modelName: 'locale',
      serviceIndexKey: 'indexByFactory',
      nameKey: 'name',
      hasMeta: false,
      placeholder: t('選擇'),
    },
  })

  // MEMO
  const defaultLocale = React.useMemo(() => {
    const langMap = {
    en: 'us',
    zh: 'tw',
    'zh-TW': 'tw',
    'zh-CN': 'cn',
    jp: 'ja',
    ja: 'ja',
    ko: 'kor',
    kr: 'kor'
  }
   const mappedLang = langMap[currentLang] || currentLang
  return currentLocales.find(locale => locale.code === mappedLang) || currentLocales[0] || {}
}, [currentLocales, currentLang])

  const __params = React.useMemo(() => {
    const _params = {
      locale: defaultLocale?.id,
    }
    return _params
  }, [currentRefreshCounter]);


  return (
    <>
      {!loading ? (
        <>
          <WsInfiniteScrollPagination
            modelName={'content_text'}
            params={__params}
            searchLabel={t('搜尋')}
            filterFields={filterFields}
            defaultFilterValue={{
              locale: defaultLocale
            }}
            emptyTitle={t('目前尚無資料')}
            renderItem={({ item, index }) => {
              return (
                <LlContentTextCard001
                  item={item}
                  contentTextLocale={defaultLocale}
                ></LlContentTextCard001>
              )
            }}
          ></WsInfiniteScrollPagination>


        </>
      ) : (
        <>
          <WsLoading
            type="a"
            style={{
              flex: 1,
              backgroundColor: 'rgba(3,13,31,0.15)'
            }}
          />
        </>
      )
      }
    </>
  )
}

export default SettingTranslation
