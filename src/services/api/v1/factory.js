import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async userIndex({ params }) {
    return base.index({
      preUrl: `factory/user/index`,
      params: {
        ...params,
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'factory',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  getAccessibleAllFactories(currentUser, currentOrganizationId) {
    const _data = currentUser.factories.filter(
      factory => factory.organization_id === currentOrganizationId
    )
    return _data
  },
  getIdsByArray(arr) {
    const ids = arr.map(item => item.id);
    return ids.join(',');
  },
  formattedChildFactoriesToItems(factories) {
    return factories.map(factory => {
      const updatedFactory = { ...factory };
      if (updatedFactory.child_factories) {
        updatedFactory.items = this.formattedChildFactoriesToItems(updatedFactory.child_factories);
        delete updatedFactory.child_factories;
      }
      return updatedFactory;
    });
  },
  async indexAllRelated({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'index/all/related',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexAll({ params }) {
    return base.index({
      preUrl: `factory/index/all`,
      params: {
        ...params,
        organization: S_Processor.getFactoryParams().factory
      }
    })
  },
}
