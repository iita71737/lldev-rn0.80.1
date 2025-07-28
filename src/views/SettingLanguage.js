import React from 'react'
import { Pressable, ScrollView, Alert } from 'react-native'
import { useSelector } from 'react-redux'
import { WsToggleBtn, WsText, WsLoading } from '@/components'
import { useTranslation } from 'react-i18next'
import S_Locale from '@/services/api/v1/locale'
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

const SettingLanguage = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // console.log(currentUser,'currentUser--');

  // State
  const [loading, setLoading] = React.useState(false)
  const [locales, setLocales] = React.useState()
  const [langCode, setLangCode] = React.useState()

  // Services
  const $_fetchLocales = async () => {
    // const res = await S_Locale.index()
    const res = await S_Locale.indexByFactory({})
    if (res) {
      const langs = res.data
      langs.forEach(item => {
        if (item.code == 'us') {
          item.code = 'en'
        }
      })
      setLocales(langs)
    }
  }

  const $_changeUserLocale = locale => {
    setLoading(true)
    try {
      i18n.changeLanguage(locale.code)
        .then((t) => {
          if (locale.code === 'us') {
            locale.code = 'en'
          }
          setLangCode(locale.code)
          $_postApi(locale)
        });
    } catch (err) {
      console.error(err, '$_changeUserLocale error')
    }
  }

  const $_postApi = async locale => {
    const _locale = locale.id
    try {
      const res = await axios.patch(
        `${axios.defaults.baseURL}${'/auth/user'}`,
        {
          locale: _locale
        }
      )
      const _currentUser = {
        ...currentUser,
        locale: locale
      }
      store.dispatch(setCurrentUser(_currentUser))
      Alert.alert(
        t('設定語言成功'),      // title
        undefined,             // message （如果不需要就設 undefined 或空字串）
        [
          {
            text: t('確定'),    // 這裡自己放要翻譯的按鈕文字
            onPress: () => { /* 如果想做點擊後的動作 */ },
            style: 'default'   // 或 'cancel' / 'destructive'
          }
        ],
        { cancelable: false }  // 可選參數，決定背景點擊是否可關閉
      )
      setLoading(false)
    } catch (err) {
      Alert.alert(t('更新語言錯誤'))
    }
  }

  React.useEffect(() => {
    $_fetchLocales()
  }, [])

  React.useEffect(() => {
    if (currentUser) {
      setLangCode(currentUser?.locale?.code)
    }
  }, [currentUser])

  return (
    <>
      {!loading && locales ? (
        <>
          {locales.map((locale, localeIndex) => {
            return (
              <WsToggleBtn
                type="b"
                key={localeIndex}
                isActive={locale.code === langCode ? true : false}
                onPress={() => {
                  $_changeUserLocale(locale)
                }}>
                {t(locale.name)}
              </WsToggleBtn>
            )
          })}
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
      )}
    </>
  )
}

export default SettingLanguage
