import C_deeplink from '@/__config/deeplink'

export default {
  getDeeplinks() {
    let deeplinks = {
      ...C_deeplink
    }
    // console.log(deeplinks,'-deeplinks-');
    return deeplinks
  },
}