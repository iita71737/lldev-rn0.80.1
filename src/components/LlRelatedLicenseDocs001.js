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
  LlLicenseCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_License from '@/services/api/v1/license'

const LlRelatedLicenseDocs001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    articles,
    acts,
    guidelines,
    guideline_articles,
  } = props

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      articles: articles ? articles : undefined,
      acts: acts ? acts : undefined,
      guidelines: guidelines ? guidelines : undefined,
      guideline_articles: guideline_articles ? guideline_articles : undefined
    }
    return _params
  }, [articles, acts, guidelines, guideline_articles]);

  return (
    <View
      style={{
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'} testID={'相關證照文件'}>{t('相關證照文件')}</WsText>
      <WsInfiniteScroll
        service={S_License}
        serviceIndexKey={'index'}
        params={__params}
        shouldHandleScroll={false}
        renderItem={({ item, index }) => {
          return (
            <View
              key={index}
              style={{
              }}>
              <LlLicenseCard001
                testID={item.id}
                item={item}
                onPress={() => {
                  navigation.push('RoutesLicense', {
                    screen: 'LicenseShow',
                    params: {
                      id: item.id,
                      type: item.license_type
                    }
                  })
                }}
                style={{
                  marginTop: 8
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

export default LlRelatedLicenseDocs001