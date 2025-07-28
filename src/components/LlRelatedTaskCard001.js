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
  // LlTrainingCard003,
  WsSkeleton,
  // LlTrainingCard001,
  // LlTaskCard002,
  LlTaskCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
// import S_Training from '@/services/api/v1/training'
import S_Task from '@/services/api/v1/task'

const LlRelatedTaskCard001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    guideline_version,
    guideline_article_version,
  } = props

  const [params, setParams] = React.useState({
    guideline_version: guideline_version ? guideline_version : undefined,
    guideline_article_version: guideline_article_version ? guideline_article_version : undefined
  })

  return (

    <WsInfiniteScroll
      service={S_Task}
      serviceIndexKey={'index'}
      params={params}
      renderItem={({ item, index }) => {
        return (
          <LlTaskCard001
            item={item}
            onPress={() => {
              navigation.push('RoutesTask', {
                screen: 'TaskShow',
                params: {
                  id: item.id,
                }
              })
            }}
          />
        )
      }}
      emptyTitle={t('找不到符合篩選條件的結果')}
      emptyText={t('請重新設定您的篩選條件')}
    />
  )
}

export default LlRelatedTaskCard001