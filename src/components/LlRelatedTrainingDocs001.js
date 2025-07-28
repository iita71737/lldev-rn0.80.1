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
  LlTrainingCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_Training from '@/services/api/v1/training'

const LlRelatedTrainingDocs001 = (props) => {
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
      <WsText fontWeight={'600'} testID={'相關教育訓練文件'}>{t('相關教育訓練文件')}</WsText>
      <WsInfiniteScroll
        service={S_Training}
        serviceIndexKey={'index'}
        params={params}
        shouldHandleScroll={false}
        renderItem={({ item, index }) => {
          return (
            <WsPaddingContainer
              padding={0}
              style={[
                index != 0 ?
                  {
                  }
                  : {
                    marginTop: 8
                  }
              ]}
            >
              <LlTrainingCard001
                testID={item.id}
                item={item}
                style={[
                  index != 0
                    ? {
                      marginTop: 8
                    }
                    : null
                ]}
                onPress={() => {
                  navigation.push('RoutesTraining', {
                    screen: 'TrainingShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
              />
            </WsPaddingContainer>
          )
        }}
        emptyTitle={t('找不到符合篩選條件的結果')}
        emptyText={t('請重新設定您的篩選條件')}
      />
    </View >
  )
}

export default LlRelatedTrainingDocs001