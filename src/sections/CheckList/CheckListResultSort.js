import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View, SafeAreaView } from 'react-native'
import {
  WsBtn,
  WsText,
  WsIcon,
  WsFlex,
  WsStateFormView,
  LlCheckListQuestionCard002,
  WsSkeleton,
  LlCheckListRecordAnswerCard001
} from '@/components'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import S_ConstantData from '@/services/api/v1/constant_data'
import { useTranslation } from 'react-i18next'

const CheckListResultSort = props => {
   const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const { id, apiAlertId } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [answersWithEffect, setAnswersWithEffect] = useState(null)

  // Services
  const $_fetchCheckListRecordAns = async () => {
    try {
      const res = await S_CheckListRecordAns.indexV2({
        parentId: id
      });
      const record = await S_CheckListRecord.showV2({
        modelId: id
      });
      const _params = {
        model: 'checklist',
      };
      const _constantData = await S_ConstantData.index({
        params: _params
      });
      const format = await S_CheckListRecordAns.getFormatV3(res.data, _constantData);
      await Promise.all([res, record, format]);
      setAnswersWithEffect(format);
      setLoading(false);
    } catch (e) {
      console.error('Error in $_fetchCheckListRecordAns:', e);
      setLoading(false);
    }
  };


  useEffect(() => {
    $_fetchCheckListRecordAns()
  }, [id])

  return (
    <>
      {loading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <>
          {answersWithEffect && (
            <ScrollView
              testID={'ScrollView'}
              style={{
                backgroundColor: $color.primary11l,
                padding: 8,
                borderRadius: 10,
              }}>
              {answersWithEffect.map((item, itemIndex) => {
                return (
                  <View key={itemIndex}>
                    <WsFlex>
                      <WsIcon name={item.icon} size={24} color={item.color} />
                      <WsText
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 8
                        }}
                        fontWeight="bold">
                        {`${item.title} ${t('共{number}題', { number: item.ans?.length })}`}
                      </WsText>
                    </WsFlex>
                    {item.ans.map((answer, answerIndex) => {
                      return (
                        <LlCheckListRecordAnswerCard001
                          testID={`LlCheckListRecordAnswerCard001-${answerIndex}`}
                          no={answer.no ? answer.no : answer.sequence}
                          key={answerIndex}
                          style={{
                            paddingHorizontal: 8,
                            marginTop: 8
                          }}
                          cardColor={$color.white}
                          score={answer.score}
                          isFocus={answer.keypoint == 1 ? true : false}
                          answer={answer}
                        />
                      )
                    })}
                  </View>
                )
              })}
            </ScrollView>
          )}
        </>
      )}
    </>
  )
}

export default CheckListResultSort
