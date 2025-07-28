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
  WsSkeleton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_TrainingTemplate from '@/services/api/v1/internal_training_template'

const LlRelatedTrainingTemplateCard001 = (props) => {
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
      <WsText fontWeight={'600'} testID={'相關教育訓練公版'}>{t('相關教育訓練公版')}</WsText>
      <WsInfiniteScroll
        service={S_TrainingTemplate}
        serviceIndexKey={'index'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <View
              key={item}>
              <LlContractorLicenseCard002
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
                system_subclasses={item.system_subclasses}
                onPress={() => {
                  navigation.push('RoutesTraining', {
                    screen: 'TrainingTemplateShow',
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

export default LlRelatedTrainingTemplateCard001