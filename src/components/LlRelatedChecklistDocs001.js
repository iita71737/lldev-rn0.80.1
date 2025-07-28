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
  LlCheckListCard004,
  WsSkeleton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_CheckList from '@/services/api/v1/checklist'

const LlRelatedChecklistDocs001 = (props) => {
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
        marginTop: 16,
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'} testID={'相關點檢表文件'}>{t('相關點檢表文件')}</WsText>
      <WsInfiniteScroll
        service={S_CheckList}
        serviceIndexKey={'index'}
        params={params}
        shouldHandleScroll={false}
        renderItem={({ item, index }) => {
          return (
            <View
              key={item.id}
            >
              <LlCheckListCard004
                testID={item.id}
                item={item}
                style={[
                  index == 0
                    ? {
                      marginTop: 16
                    }
                    : {
                      marginTop: 8
                    }
                ]}
                name={item.name}
                id={item.id}
                is_collect={item.is_collect}
                tagIcon={item.tagIcon}
                tagText={item.tagText}
                reviewers={item.reviewers}
                checkers={item.checkers}
                taker={
                  item.owner
                    ? item.owner
                    : item.taker
                      ? item.taker
                      : t('無')
                }
                system_subclasses={item.system_subclasses}
                frequency={
                  item.frequency === 'week'
                    ? t('每週')
                    : item.frequency === 'month'
                      ? t('每月')
                      : item.frequency === 'season'
                        ? t('每季')
                        : item.frequency === 'year'
                          ? t('每年')
                          : item.frequency === 'everyTime'
                            ? t('每次作業')
                            : item.frequency === 'day'
                              ? `${t('每日')}`
                              : ''
                }
                factory_tags={item.factory_tags}
                onPress={() => {
                  navigation.push('RoutesCheckList', {
                    screen: 'CheckListShow',
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

export default LlRelatedChecklistDocs001