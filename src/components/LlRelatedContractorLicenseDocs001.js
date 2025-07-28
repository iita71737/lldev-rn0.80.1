import React from 'react'
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsIcon,
  WsText,
  WsDes,
  WsCollapsible,
  WsInfiniteScroll,
  WsFilter,
  WsPaddingContainer,
  LlBtn002,
  LlContractorLicenseCard002,
  WsSkeleton,
  LlContractorLicenseCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_ContractorLicense from '@/services/api/v1/contractor_license'

const LlRelatedContractorLicenseDocs001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    articles,
    acts
  } = props

  const [params, setParams] = React.useState({
    articles: articles ? articles : undefined,
    acts: acts ? acts : undefined
  })


  return (
    <View
      style={{
        marginTop: 16,
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'} testID={'相關承攬商資格證文件'}>{t('相關承攬商資格證文件')}</WsText>
      <WsInfiniteScroll
        service={S_ContractorLicense}
        serviceIndexKey={'index'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <LlContractorLicenseCard001
              testID={item.id}
              key={index}
              license={item}
              style={[
                index != 0 ?
                  {
                    marginTop: 16
                  } : {
                    marginTop: 8
                  }
              ]
              }
              onPress={() => {
                navigation.push('RoutesContractors', {
                  screen: 'ContractorsLicenseShow',
                  params: {
                    id: item.id
                  }
                })
              }}
            />
          )
        }}
        emptyTitle={t('找不到符合篩選條件的結果')}
        emptyText={t('請重新設定您的篩選條件')}
      />
    </View>
  )
}

export default LlRelatedContractorLicenseDocs001