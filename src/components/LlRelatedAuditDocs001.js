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
  LlAuditListCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_Audit from '@/services/api/v1/audit'

const LlRelatedAuditDocs001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    articles,
    acts,
    guidelines,
    guideline_articles,
  } = props

  const [params, setParams] = React.useState({
    articles: articles ? articles : undefined,
    acts: acts ? acts : undefined,
    guidelines: guidelines ? guidelines : undefined,
    guideline_articles: guideline_articles ? guideline_articles : undefined
  })

  return (
    <View
      style={{
        paddingTop: 16,
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'} testID={'相關稽核表文件'}>{t('相關稽核表文件')}</WsText>
      <WsInfiniteScroll
        service={S_Audit}
        serviceIndexKey={'index'}
        params={params}
        shouldHandleScroll={false}
        renderItem={({ item, index }) => {
          return (
            <LlAuditListCard001
              testID={item.id}
              item={item}
              auditId={item.id}
              style={{ marginTop: 8 }}
              name={item.name}
              owner={item.owner}
              system_subclasses={item.system_subclasses}
              onPress={() => {
                navigation.push('RoutesAudit', {
                  screen: 'AuditShow',
                  params: {
                    id: item.id,
                    versionId: item.last_version.id
                  }
                })
              }}
              AuditRequestCreateBtnVisible={false}
            />
          )
        }}
        emptyTitle={t('找不到符合篩選條件的結果')}
        emptyText={t('請重新設定您的篩選條件')}
      />
    </View>
  )
}

export default LlRelatedAuditDocs001