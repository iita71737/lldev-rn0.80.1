import React from 'react'
import {
  Pressable,
  ScrollView,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsIconBtn,
  WsBottomSheet,
  LlCheckListQuestionCard001,
  WsSkeleton,
  WsTag,
  WsEmpty,
  WsInfiniteScroll
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import gColor from '@/__reactnative_stone/global/color'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListQuestionVersion from '@/services/api/v1/checklist_question_version';
import { useSelector } from 'react-redux'
import store from '@/store'
import { setCurrentCheckListQuestions } from '@/store/data'
import S_CheckListQuestionTemplate from '@/services/api/v1/checklist_question_template'

const CheckListTemplateQuestion = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Props
  const { id, versionId } = props

  // States
  const [questions, setQuestions] = React.useState()

  // MEMO
  const params = React.useMemo(() => {
    return {
      checklist_template_versions: versionId,
    }
  }, [versionId]);

  // HELPER
  const removeLeadingZeros = (str) => {
    return str.replace(/^0+/, '');
  }

  return (
    <>
      <WsInfiniteScroll
        hasMeta={false}
        getAll={true}
        service={S_CheckListQuestionTemplate}
        serviceIndexKey={'quesIndexV2'}
        params={params}
        emptyTitle={''}
        emptyText={'共0題'}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              testID={`S_CheckListQuestion-${index}`}
              style={{
                marginVertical: 4
              }}
              key={index}
              onPress={() => {
                navigation.navigate({
                  name: 'CheckListQuestionTemplateVersionShow',
                  params: {
                    id: item.id,
                    lastVersionId: item.last_version.id
                  }
                })
              }}
            >
              <WsFlex
                justifyContent={'space-between'}
                alignItems="flex-start"
                style={{
                  padding: 16,
                  maxWidth: width,
                  backgroundColor: gColor.white
                }}>
                <WsFlex
                  style={{
                    marginRight: 4
                  }}
                  alignItems="flex-start"
                >
                  <WsText fontWeight="bold" size={14}>
                    {item.sequence ? removeLeadingZeros(item.sequence) : index + 1}
                    {'.'}
                  </WsText>
                  {item.title && (
                    <WsText
                      style={{
                        maxWidth: width * 0.5,
                        marginRight: 24
                      }}
                      fontWeight="bold"
                      size={14}>
                      {item.title}
                    </WsText>
                  )}
                </WsFlex>

                <View
                  style={{
                  }}
                >
                  {item && item.is_renew_template == 1 && (
                    <WsTag
                      backgroundColor={$color.yellow11l}
                      textColor={$color.gray}
                      style={{
                      }}>
                      {t('建議題目版本更新')}
                    </WsTag>
                  )}
                  {item && item.is_deleted_template == 1 && (
                    <WsTag
                      backgroundColor={$color.gray}
                      textColor={$color.white}
                      style={{
                      }}>
                      {t('建議項目已移除')}
                    </WsTag>
                  )}
                </View>
              </WsFlex>
            </TouchableOpacity>
          )
        }}
      />
    </>
  )
}

export default CheckListTemplateQuestion
