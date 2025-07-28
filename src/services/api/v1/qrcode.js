import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_EventType from '@/services/api/v1/event_type'
import $color from '@/__reactnative_stone/global/color'
import S_Factory from '@/services/api/v1/factory'
import store from '@/store'
import {
  setCurrentFactory,
  setCurrentOrganization,
  setCurrentViewMode,
  setRefreshCounter
} from '@/store/data'
import S_ModulePage from '@/services/api/v1/module_page'
import AsyncStorage from '@react-native-community/async-storage'

export default {
  async findByUrl({ params }) {
    return base.index({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'qrcode/find_by_url',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async $_setLocalStorage(item, mode) {
    if (mode === 'factory') {
      try {
        await AsyncStorage.setItem('factory', JSON.stringify(item))
        await AsyncStorage.removeItem('organization');
      }
      catch (exception) {
        console.log(exception)
      }
    }
    if (mode === 'organization') {
      try {
        await AsyncStorage.setItem('organization', JSON.stringify(item))
        await AsyncStorage.removeItem('factory');
      }
      catch (exception) {
        console.log(exception)
      }
    }
  },
  async readAndRedirect(popupContent, factoryId, navigation) {
    // 不同廠的系統通知則切換工廠
    if (popupContent &&
      popupContent?.redirectFactory &&
      (popupContent?.redirectFactory?.id !== factoryId)) {
      if (popupContent.name?.includes('集團')) {
        const _factory = popupContent?.redirectFactory
        store.dispatch(setCurrentFactory(_factory))
        store.dispatch(setCurrentOrganization(_factory))
        store.dispatch(setCurrentViewMode('organization'))
        setTimeout(() => {
          S_ModulePage.redirectByAPIParams(popupContent?.payload, navigation)
        }, 1000)
      } else {
        try {
          // setRedirectLoading(true)
          // await $_checkoutFactory(popupContent?.redirectFactory?.id)
          try {
            const _factory = popupContent?.redirectFactory
            this.$_setLocalStorage(_factory, 'factory')
            store.dispatch(setCurrentFactory(_factory))
          } catch (e) {
            console.error(e);
          }
          setTimeout(() => {
            S_ModulePage.redirectByAPIParams(popupContent?.payload, navigation)
          }, 1000)
        } catch (e) {
          // setRedirectLoading(false)
          Alert.alert(t('您無此單位內相關權限，請聯絡系統管理員'))
          return
        }
        // setRedirectLoading(false)
      }
    } else {
    }
  },
  async getRedirectFactory(_factoryId, data) {
    try {
      const _redirectFactory = await S_Factory.show({ modelId: _factoryId })
      const _data = {
        redirectFactory: _redirectFactory,
        payload: data
      }
      return _data
    } catch (e) {
      console.error(e);
    }
  },
  async redirectByScanUrl(url, navigation) {
    let _hasReadAndRedirectTriggered = false;
    // 編譯URL
    const decodedURL = decodeURIComponent(url);
    const modifiedURL = decodedURL.replace("signin?redirect=/", "");
    // 狀態管理
    const state = store.getState()
    const currentFactory = state.data.currentFactory
    // 正則表示式
    const factoryRegex = /\/factory\/([a-f\d-]+)\/checklist-content\/([a-f\d-]+)/;
    const qrcodeRegex = /\/factory\/([a-f\d-]+)\/qrcode\/([a-f\d-]+)/;
    if (factoryRegex.test(modifiedURL)) {
      const matches = modifiedURL.match(factoryRegex);
      if (matches) {
        const factoryId = matches[1];
        const checklistContentId = matches[2];
        const _params = {
          factoryId: factoryId,
          modelId: checklistContentId,
          url: modifiedURL
        };
        if (currentFactory && _params && (currentFactory.id != _params.factoryId)) {
          const _factory = await S_Factory.show({ modelId: _params.factoryId })
          store.dispatch(setCurrentFactory(_factory))
        }
        navigation.push('RoutesCheckList', {
          screen: 'CheckListShow',
          params: {
            id: _params.modelId
          }
        })
      }
    } else if (qrcodeRegex.test(modifiedURL)) {
      const matches = modifiedURL.match(qrcodeRegex);
      if (matches) {
        const factoryId = matches[1];
        const qrcode = matches[2];
        navigation.replace('ViewQRcodeSection', {
          url: modifiedURL
        })
      }
    } else {
      console.log('qrcode.js 3333');
      console.log(modifiedURL, 'modifiedURL');
      let item = {}
      const _params = {
        url: modifiedURL
      }
      const _res2 = await S_ModulePage.findAppPage({ params: _params })
      item.factoryId = _res2.data?.params?.factory
      item.from_module = _res2.data?.module
      item.route = _res2.data?.route
      item.modelId = _res2.data?.params?.id

      if (currentFactory?.id === item?.factoryId) {
        S_ModulePage.redirectByAPIParams(item, navigation)
      }
      else {
        // console.log('qrcodejs 222222222');
        if (item.from_module) {
          // console.log('qrcodejs 333333333');
          const _item = await this.getRedirectFactory(item?.factoryId, item)
          if (_item && currentFactory?.id && navigation && !_hasReadAndRedirectTriggered) {
            _hasReadAndRedirectTriggered = true
            await this.readAndRedirect(_item, currentFactory?.id, navigation)
          }
        } else {
          console.log('4444');
          // openURL(item?.url)
        }
      }
    }
  },
  parseUrlParamsByQRcodeList(url) {
    const regex = /\/factory\/([a-f\d-]+)\/qrcode\/([\w-]+)/;
    const matches = url.match(regex);
    if (matches) {
      const factoryParams = matches[1];
      const qrcodeParam = matches[2];
      return {
        factory: factoryParams,
        qrcode: qrcodeParam,
        url: url
      };
    } else {
      return null;
    }
  },
  parseUrlParams(url) {
    const regex = /\/factory\/([a-f\d-]+)\/checklist-content\/([a-f\d-]+)/;
    const match = url.match(regex);
    if (match && match.length === 3) {
      const factoryId = match[1];
      const checklistContentId = match[2];
      const hasAssignmentIndex = url.includes('/assignment-index');
      return {
        factory: factoryId,
        modelId: checklistContentId,
        url: url,
        hasAssignmentIndex: hasAssignmentIndex,
      };
    }
    return null;
  }
}
