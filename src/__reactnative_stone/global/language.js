import i18n from 'react-i18next'
import { reactI18nextModule } from 'react-i18next'
import S_Language from '@/services/api/v1/package_language'
import { NativeModules, Platform } from 'react-native'

const languageDetector = {
  type: 'languageDetector',
  async: true, // flags below detection to be async
  detect: callback => {
    return Localization.getLocalizationAsync().then(({ locale }) => {
      callback(locale)
    })
  },
  init: () => { },
  cacheUserLanguage: () => {
    return Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
      : NativeModules.I18nManager.localeIdentifier
  }
}
