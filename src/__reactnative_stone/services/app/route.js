import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
export default {
  setRoutesMenuTabBarVisible(route, hideOnScreens) {
    const routeName = getFocusedRouteNameFromRoute(route)
    if (hideOnScreens.indexOf(routeName) > -1) {
      return false
    } else {
      return true
    }
  }
}
