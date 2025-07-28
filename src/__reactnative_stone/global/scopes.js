import store from '@/store'
import config from '@/__config/index'
import { WsScopeBlock } from '@/components'

export const scopeFilterScreen = (requiredScopes, ViewComponent) => {
  const userScopes = store.getState().data.userScopes

  // 白名單：有這個就通通放行
  if (userScopes.includes('wall-passer')) {
    return ViewComponent
  }

  // 統一把傳入參數 normalize 成一維的「要檢查的 scope 字串」陣列
  const scopesToCheck = Array.isArray(requiredScopes)
    ? requiredScopes.flatMap(name =>
        // 如果 config.scopes[name] 存在，就展開這組；否則用 [name] 當單一 scope
        config.scopes[name] ?? [name]
      )
    : (config.scopes[requiredScopes] ?? [requiredScopes])

  // 只要有任一個通過就算有權限
  const hasPermission = scopesToCheck.some(scope =>
    userScopes.includes(scope)
  )

  return hasPermission
    ? ViewComponent
    : WsScopeBlock
}
