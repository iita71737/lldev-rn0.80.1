import React from 'react'
import { ScrollView, View, Text, SafeAreaView } from 'react-native'
import { WsCard, WsText } from '@/components'
import { useTranslation } from 'react-i18next'

const LlCheckListQuestionCard004 = props => {
  const { t, i18n } = useTranslation()

  const { item } = props

  return (
    <View>
      <WsCard
        style={{
          marginLeft: 16,
          marginRight: 16,
          marginTop: 16
        }}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <WsText style={{ fontSize: 12 }}>{t('年度異常累計')}</WsText>
            <View
              style={{
                marginLeft: 10,
                justifyContent: 'center',
                alignItems: 'center',
                height: 23,
                width: 23,
                borderRadius: 25,
                backgroundColor: 'rgb(255,238,236)'
              }}>
              <Text style={{ color: 'rgb(221,78,65)' }}>
                {item.checklist_record_answers_count
                  ? item.checklist_record_answers_count
                  : ''}
              </Text>
            </View>
          </View>
          <WsText
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginLeft: 5,
              marginBottom: 10
            }}>
            {item.title}
          </WsText>
          <WsText
            style={{
              fontSize: 12,
              color: 'rgb(128,128,128)',
              position: 'relative'
            }}>
            {item.id}
          </WsText>
        </View>
      </WsCard>
    </View>
  )
}

export default LlCheckListQuestionCard004
