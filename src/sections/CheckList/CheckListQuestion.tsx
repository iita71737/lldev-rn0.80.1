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
import S_CheckListQuestion from '@/services/api/v1/checklist_question'

interface CheckListQuestionProps {
  id: number;
  versionId: number;
}


const CheckListQuestion: React.FC<CheckListQuestionProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { width } = Dimensions.get('window')

  // Props
  const { versionId } = props

  // States
  const [params] = React.useState({
    checklist_version_id: versionId
  })



  // HELPER
  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  }

  return (
    <>
      <WsInfiniteScroll
        service={S_CheckListQuestion}
        serviceIndexKey={'indexV2'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <>
              <TouchableOpacity
                testID={`S_CheckListQuestion-${index}`}
                style={{
                  marginVertical: 4,
                }}
                key={index}
                onPress={() => {
                  navigation.push('CheckListQuestionShow', {
                    id: item.id,
                    lastVersionId: item.last_version.id
                  })
                }}
              >
                <WsFlex
                  justifyContent={'space-between'}
                  alignItems="flex-start"
                  style={{
                    padding: 16,
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
                      {'. '}
                    </WsText>
                    {item.title && (
                      <WsText
                        style={{
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
                          // marginTop: 8
                        }}>
                        {t('建議項目已移除')}
                      </WsTag>
                    )}
                  </View>
                </WsFlex>
              </TouchableOpacity>
            </>
          )
        }}
        ListFooterComponent={() => {
          return (
            <>
              <View
                style={{
                  height: 150,
                }}
              >
              </View>
            </>

          )
        }}
      />
    </>
  )
}

export default CheckListQuestion
