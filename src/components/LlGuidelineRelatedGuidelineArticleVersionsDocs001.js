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
  LlGuidelineCard001,
  LlRelatedGuidelineItem001,
  WsCard
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_Act from '@/services/api/v1/act'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'

const LlGuidelineRelatedGuidelineArticleVersionsDocs001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    guidelines,
    guideline_articles,
    guideline_id,
    guidelineArticleVersion,
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
      <WsText fontWeight={'600'}>{t('相關內規層級條文')}</WsText>
      <WsInfiniteScroll
        service={S_GuidelineArticleVersionAdmin}
        serviceIndexKey={'indexFactory'}
        params={params}
        shouldHandleScroll={false}
        renderItem={({ item, index }) => {
          return (
            <LlRelatedGuidelineItem001
              key={index}
              item={item}
              modelName={'act'}
              cardStyle={true}
            />
          )
        }}
      />
    </View >
  )
}

export default LlGuidelineRelatedGuidelineArticleVersionsDocs001