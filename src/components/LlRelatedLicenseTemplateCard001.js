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
  LlLicenseCard001,
  LlLicenseCard002,
  WsSkeleton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation, CommonActions } from '@react-navigation/native'
import S_LicenseTemplates from '@/services/api/v1/license_templates'

const LlRelatedLicenseTemplateCard001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    articles,
    acts
  } = props

  const [params, setParams] = React.useState({
    articles: articles ? articles : undefined,
    acts: acts ? acts :undefined
  })

  return (
    <View
      style={{
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'} testID={'相關證照公版'}>{t('相關證照公版')}</WsText>
      <WsInfiniteScroll
        service={S_LicenseTemplates}
        serviceIndexKey={'factoryIndex'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <View
              key={index}>
              <LlLicenseCard002
                testID={item.id}
                style={{
                  marginTop: 8
                }}
                item={item}
                onPress={() => {
                  navigation.push('RoutesLicense', {
                    screen: 'LicenseTemplateShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
              />
            </View>
          )
        }}
        emptyTitle={t('找不到符合篩選條件的結果')}
        emptyText={t('請重新設定您的篩選條件')}
      />
    </View>
  )
}

export default LlRelatedLicenseTemplateCard001