export default {
  getFailedNavigation(routeKey, navigation) {
    switch (routeName) {
      case 'RouteAlert':
        return navigation.navigate('RouteAlert', {
          screen: 'AlertIndex'
        })
      case 'RouteEvent':
        return navigation.navigate('RouteEvent', {
          screen: 'EventIndex'
        })
    }
  }
}
