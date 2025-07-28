import i18next from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import tw from '@/__reactnative_stone/lang/zh_tw.json'
import en from '@/__reactnative_stone/lang/en.json'
import cn from '@/__reactnative_stone/lang/cn.json'
import vi from '@/__reactnative_stone/lang/vi.json'
import kor from '@/__reactnative_stone/lang/kor.json'
import ja from '@/__reactnative_stone/lang/ja.json'
import S_Language from '@/services/api/v1/package_language'
import S_Lang from '@/__reactnative_stone/services/app/lang'
import S_PackageLanguage from '@/services/api/v1/package_language'
import S_ContextText from '@/services/api/v1/content_text'
import S_Locale from '@/services/api/v1/locale'

export default {
  languageDetector: {
    type: 'languageDetector',
    async: true,
    detect: cb => cb('tw'),
    init: () => { },
    cacheUserLanguage: () => { }
  },
  i18nInit() {
    i18next
      .use(this.languageDetector)        // ① 插件：自動偵測使用者語言（例如從瀏覽器、App 設定、localStorage……）
      .use(initReactI18next)             // ② 插件：將 i18next 綁到 React，讓 <Trans>、useTranslation() 等 Hook 可運作
      .init({                            // ③ 真正呼叫初始化
        compatibilityJSON: 'v3',         // ⚙️ 相容性設定：讓新版 i18next 能正確讀舊版 JSON 資源
        fallbackLng: 'tw',               // 🔄 當偵測不到或沒有該語系時，預設回退到「繁中 (tw)」
        debug: false,                    // 🐛 是否開啟除錯訊息（log 出已載入哪些資源、選到哪種語言……）
        resources: {                     // 🌐 所有語系的翻譯檔集合
          tw: { translation: tw },      // — 繁中 (tw)：匯入變數 tw 裡的 key/翻譯對
          cn: { translation: cn },      // — 簡中
          ja: { translation: ja },      // — 日文
          en: { translation: en },      // — 英文
          vi: { translation: vi },      // — 越南文
          kor: { translation: kor }      // — 韓文
        },
        interpolation: {
          escapeValue: false,            // 🔣 參數插入時不自動做 HTML escape（React 本身已安全處理）
        },
        react: {
          useSuspense: false,            // 👀 不用 React Suspense 包裹，如有錯誤時也不跑到 Suspense fallback
        },
        keySeparator: false,   // ← 關閉「.」當 key 分隔
        nsSeparator: false,    // ← 如果你也用了 namespace 的話
      })
  },
  async langWithApiAndLocal() {
    const apiLangs = await S_Language.index()
    // console.log(apiLangs, 'apiLangs');
    let _en = { ...en }
    let _cn = { ...cn }
    let _ja = { ...ja }
    let _tw = { ...tw }
    let _vi = { ...vi }
    let _kor = { ...kor }
    apiLangs.data.forEach(apiLang => {
      switch (apiLang.lang) {
        case 'tw':
          _tw = {
            ...S_Lang._tw,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'cn':
          _cn = {
            ...S_Lang._cn,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'ja':
          _ja = {
            ...S_Lang._ja,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'us':
          _en = {
            ...S_Lang._en,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'vi':
          _vi = {
            ...S_Lang._vi,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'kor':
          _kor = {
            ...S_Lang._kor,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
      }
    })
    const resources = {
      cn: { translation: _cn },
      tw: { translation: _tw },
      ja: { translation: _ja },
      en: { translation: _en },
      vi: { translation: _vi },
      kor: { translation: _kor }
    }
    return resources
  },
  async langWithApiAndLocal002() {
    const apiLangs = await S_Locale.index()
    // console.log(apiLangs, 'apiLangs');
    const customizedLangs = await this.contextTextBundle(apiLangs)
    let _en = { ...en }
    let _cn = { ...cn }
    let _ja = { ...ja }
    let _tw = { ...tw }
    let _vi = { ...vi }
    let _kor = { ...kor }
    customizedLangs.forEach(apiLang => {
      console.log(apiLang.lang?.code,'contextTextBundle lang');
      switch (apiLang?.lang?.code) {
        case 'tw':
          _tw = {
            ...S_Lang._tw,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'cn':
          _cn = {
            ...S_Lang._cn,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'ja':
          _ja = {
            ...S_Lang._ja,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'us':
          _en = {
            ...S_Lang._en,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'vi':
          _vi = {
            ...S_Lang._vi,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
        case 'kor':
          _kor = {
            ...S_Lang._kor,
            ...S_Lang.i18nVueToReactFormat(apiLang.payload)
          }
          break
      }
    })
    const resources = {
      cn: { translation: _cn },
      tw: { translation: _tw },
      ja: { translation: _ja },
      en: { translation: _en },
      vi: { translation: _vi },
      kor: { translation: _kor }
    }
    return resources
  },
  async contextTextBundle(apiLangs) {
    const fetchI18nDataForAllLangs = async (apiLangs) => {
      try {
        const responses = await Promise.all(
          apiLangs.data.map(lang =>
            S_ContextText.i18nIndex({
              params: {
                locale: lang.id
              }
            }).then(res => ({
              lang,
              payload: res.data
            }))
          )
        )
        return responses
      } catch (err) {
        console.error('fetchI18nDataForAllLangs error:', err)
        throw err
      }
    }
    const result = await fetchI18nDataForAllLangs(apiLangs)
    // for debugging
    // result.forEach(({ lang, payload }) => {
    //   console.log(`語系: ${lang.name}, ID: ${lang.id}, 總筆數: ${Object.keys(payload).length}`);
    //   Object.entries(payload).slice(0, 5).forEach(
    //     ([k, v], i) => console.log(`${i + 1}. ${k}: ${v}`)
    //   )
    // });
    return result
  }
}
