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
  }
}