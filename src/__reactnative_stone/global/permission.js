import store from '@/store'
import config from '@/__config/index'

export const scopePermission = (pageNames, currentUserScopes) => {
  // 1. 取 userScopes：優先用傳入的，否則從 store 拿
  const userScopes = Array.isArray(currentUserScopes)
    ? currentUserScopes
    : store.getState().data.userScopes

  const currentUser = store.getState().data.currentUser

  // 2. 白名單：wall-passer 通通放行
  if (currentUser?.is_administrator) {
    return true
  }

  // 3. normalize pageNames 成陣列
  const pages = Array.isArray(pageNames)
    ? pageNames
    : [pageNames]

  // 4. flatMap：展開 config.scopes[name]（若有定義），否則當成 [name]
  const requiredScopes = pages.flatMap(name =>
    config.scopes[name] != null
      ? config.scopes[name]
      : [name]
  )

  // 5. 只要任一 requiredScope 出現在 userScopes，就回傳 true
  return requiredScopes.some(scope => userScopes.includes(scope))
}

export const scopeSubscriptions = (init, factoryModuleText) => {
  if (init && init.subscriptions) {
    return init.subscriptions.includes(factoryModuleText)
  } else {
    return false
  }
}