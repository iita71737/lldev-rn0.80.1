import base from '@/__reactnative_stone/services/wasaapi/v1/__base';
import { StyleSheet, View, ScrollView } from 'react-native';
import S_Processor from '@/services/app/processor';

export default {
  async index({ params }) {
    return base.index({
      modelName: 'constant_data',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    });
  }
}