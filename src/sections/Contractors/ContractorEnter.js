import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  WsInfiniteScroll,
  LlContractorEnterCard001,
  WsEmpty,
  WsPaddingContainer,
  WsGradientButton
} from '@/components'
import i18next from 'i18next'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import { useTranslation } from 'react-i18next'

const ContractorEnter = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const { contractor, navigation, target_factory, route } = props

  // MEMO
  const __params = React.useMemo(() => {
    if (contractor && target_factory) {
      const _params = {
        order_way: 'desc',
        order_by: 'enter_start_date',
        contractor: contractor.id,
        target_factory: target_factory
      }
      return _params
    }
  }, [contractor, target_factory]);

  console.log(__params, 'S_ContractorEnterRecord');

  // Render
  return (
    <>
      <WsInfiniteScroll
        service={S_ContractorEnterRecord}
        serviceIndexKey={'indexV2'}
        params={__params}
        padding={16}
        emptyTitle={t('目前尚無資料')}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlContractorEnterCard001
                testID={`LlContractorEnterCard001-${index}`}
                item={item}
                onPress={() => {
                  navigation.navigate('RoutesContractorEnter', {
                    screen: 'ContractorEnterShow',
                    params: {
                      id: item.id,
                      from: route
                    }
                  })
                }}
                style={[
                  index != 0
                    ? {
                      marginTop: 8
                    }
                    : null
                ]}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default ContractorEnter
