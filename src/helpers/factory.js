export default {
  getOrganizationFactoryScopeList(originData) {
    let organizationFactoryScopeList = []
    originData.forEach((data) => {
      if (data.has_scope === 1) {
        const item = {
          id: data.id,
          label: data.name,
          subscriptions: data.subscriptions,
          value: data.id
        }
        if (data.child_factories && data.child_factories.length > 0) {
          item.child_factories = data.child_factories
        } else {
          item.items = []
        }
        organizationFactoryScopeList.push(item)
      } else {
        if (data.child_factories && data.child_factories.length > 0) {
          const items = data.child_factories
          organizationFactoryScopeList = [...organizationFactoryScopeList, ...items]
        }
      }
    })
    return organizationFactoryScopeList
  },


  // 250731-issue
  // factoryInitRoute() {
  //   const isAdministrator = store.state.stone_auth.isAdministrator
  //   const userJoinedFactoryIdList = store.state.stone_auth.currentUser.factory_ids
  //   const userHasScopeFactoryIdList = store.state.auth.scopes.factory.map((scope) => {
  //     return scope.id
  //   });
  //   if (isAdministrator) {
  //     if (userJoinedFactoryIdList.length) {
  //       router.push(
  //         `/factory/${userJoinedFactoryIdList[0]}/dashboard-main`,
  //       );
  //     } else {
  //       router.replace('/not-found');
  //     }
  //     return;
  //   }
  //   if (userJoinedFactoryIdList.length && userHasScopeFactoryIdList.length) {
  //     const factoryId = this.getFactoryId(userJoinedFactoryIdList, userHasScopeFactoryIdList)
  //     if (factoryId) {
  //       const showDashboard = scope.$_isAvailable(['dashboard-show'], {
  //         factoryId,
  //       });
  //       if (showDashboard) {
  //         router.push(`/factory/${factoryId}/dashboard-main`);
  //       } else {
  //         router.push(`/factory/${factoryId}/board-overview`);
  //       }
  //     } else {
  //       store.dispatch('error/setErrorMessage', 'no scopes');
  //       store.dispatch('error/setErrorTrue');
  //     }
  //   } else {
  //     store.dispatch('error/setErrorMessage', 'no scopes');
  //     store.dispatch('error/setErrorTrue');
  //   }
  // },

  // getFactoryId(userJoinedFactoryIdList, userHasScopeFactoryIdList) {
  //   const userHasScopeSet = new Set(userHasScopeFactoryIdList);
  //   const commonFactoryIds = userJoinedFactoryIdList.filter(id =>
  //     userHasScopeSet.has(id)
  //   );
  //   if (commonFactoryIds.length === 0) {
  //     return null;
  //   }
  //   const localStorageFactoryId = localStorage.getItem('factoryId');
  //   if (localStorageFactoryId && commonFactoryIds.includes(localStorageFactoryId)) {
  //     return localStorageFactoryId;
  //   }
  //   return commonFactoryIds[0];
  // }
}