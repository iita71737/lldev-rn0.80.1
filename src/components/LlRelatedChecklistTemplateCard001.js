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
import S_CheckListTemplate from '@/services/api/v1/checklist_template'

const LlRelatedChecklistTemplateCard001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

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
        marginTop: 16,
        paddingHorizontal: 16
      }}
    >
      <WsText fontWeight={'600'} testID={'相關點檢表公版'}>{t('相關點檢表公版')}</WsText>
      <WsInfiniteScroll
        service={S_CheckListTemplate}
        serviceIndexKey={'index'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <View
              key={item}>
              <LlCheckListCard004
                testID={item.id}
                key={item.id}
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
                reviewer={
                  item.reviewer ? item.reviewer.name : t('無')
                }
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
                    screen: 'CheckListTemplateShow',
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

export default LlRelatedChecklistTemplateCard001