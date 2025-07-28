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
  LlTrainingCard003,
  WsSkeleton,
  LlGuidelineCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_Act from '@/services/api/v1/act'
import S_Guideline from '@/services/api/v1/guideline'

const LlRelatedGuidelineVersionsDocs001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    guidelines,
    guideline_articles,
  } = props

  const [params, setParams] = React.useState({
    guidelines: guidelines ? guidelines : undefined,
    guideline_articles: guideline_articles ? guideline_articles : undefined
  })

  return (
    <View
      style={{
        marginTop: 16,
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'}>{t('相關內規')}</WsText>
      <WsInfiniteScroll
        service={S_Guideline}
        serviceIndexKey={'index'}
        params={params}
        shouldHandleScroll={false}
        renderItem={({ item, index }) => {
          return (
            <LlGuidelineCard001
              key={item.id}
              tags={item.factory_tags}
              item={item}
              is_collect_visible={false}
              title={item.last_version ? item.last_version.name : null}
              announce_at_visible={true}
              effect_at_visible={false}
              deletable={false}
              editable={true}
              updatable={true}
              guideline_status={item.guideline_status}
              isChange={
                item && item.updated_at ?
                  S_Act.getActUpdateDateBadge(item.updated_at) : null
              }
              onPress={() => {
                navigation.push('RoutesAct', {
                  screen: 'GuidelineAdminShow',
                  params: {
                    id: item.id,
                  }
                })
              }}
              style={{
                marginTop: 8,
              }}
            />
          )
        }}
        emptyTitle={t('找不到符合篩選條件的結果')}
        emptyText={t('請重新設定您的篩選條件')}
      />
    </View >
  )
}

export default LlRelatedGuidelineVersionsDocs001