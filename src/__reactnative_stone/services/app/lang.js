export default {
  i18nVueToReactFormat(translationJSON) {
    const _translation = {}
    for (let key in translationJSON) {
      if (typeof translationJSON[key] === 'string') {
        _translation[key] = translationJSON[key].replace(
          /{|}/gi,
          function (matched) {
            const mapObj = {
              '{': '{{',
              '}': '}}'
            }
            return mapObj[matched]
          }
        )
      }
    }
    return _translation
  }
}
