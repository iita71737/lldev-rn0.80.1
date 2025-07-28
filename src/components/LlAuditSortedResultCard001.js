import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import { WsText, WsFlex, WsTag } from '@/components'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlAuditQuestionCard001 = props => {
  const { t, i18n } = useTranslation()

  const {
    no,
    title,
    style,
    score,
    onPress,
    backgroundColor = $color.white,
    isFocus = false,
    id
  } = props

  // State
  const [auditAnswer, setAuditAnswer] = React.useState()
  const [quesTag, setQuesTag] = React.useState(null)
  const [riskStandard] = React.useState({
    not: {
      title: t('未答題'),
      icon: 'md-help',
      color: $color.gray,
      textColor: $color.gray,
      backgroundColor: $color.gray11l,
      score: null
    },
    major: {
      title: `${t('Major(主要缺失)')}`,
      icon: 'ws-filled-warning',
      color: $color.danger,
      textColor: $color.danger,
      backgroundColor: $color.danger11l,
      score: 23
    },
    minor: {
      title: `${t('Minor(次要缺失)')}`,
      icon: 'ws-filled-warning',
      color: $color.yellow,
      textColor: $color.gray,
      backgroundColor: $color.yellow11l,
      score: 22
    },
    ofi: {
      title: `${t('OFI(待改善)')}`,
      icon: 'ws-filled-warning',
      color: $color.primary,
      textColor: $color.primary,
      backgroundColor: $color.primary11l,
      score: 21
    },
    pass: {
      title: t('合規'),
      icon: 'md-check-circle',
      color: $color.green,
      textColor: $color.gray3d,
      backgroundColor: $color.green11l,
      score: 25
    },
    nor: {
      title: t('不適用'),
      icon: 'scc-liff-close-circle',
      color: $color.gray,
      textColor: $color.gray,
      backgroundColor: $color.white2d,
      score: 20
    }
  })

  // Services
  const $_fetAuditAnswer = async () => {
    const res = await S_AuditRecordAns.show({
      modelId: id
    })
    setAuditAnswer(res)
  }

  // Function
  const $_setStyle = () => {
    for (let riskKey in riskStandard) {
      if (score == riskStandard[riskKey].score) {
        setQuesTag(riskStandard[riskKey])
      }
    }
  }

  React.useEffect(() => {
    $_setStyle()
  }, [])

  React.useEffect(() => {
    if (id) {
      $_fetAuditAnswer()
    }
  }, [])

  return (
    <>
      {quesTag && (
        <TouchableOpacity onPress={onPress}>
          <WsFlex
            alignItems="flex-start"
            style={[
              {
                padding: 16,
                backgroundColor: backgroundColor
              },
              style
            ]}>
            <WsFlex flexDirection="row" alignItems="flex-start">
              <WsText
                testID={no}
                fontWeight="bold"
                size={14}
                style={{
                  width: 60
                }}>
                {no}
              </WsText>
              <View
                style={{
                  flex: 1
                }}>
                {auditAnswer && auditAnswer.title && (
                  <WsText fontWeight="bold" size={14}>
                    {auditAnswer.title}
                  </WsText>
                )}
                <WsFlex>
                  <WsTag
                    style={{
                      marginTop: 8
                    }}
                    size={10}
                    icon={quesTag.icon}
                    borderRadius={20}
                    textColor={quesTag.textColor}
                    iconColor={quesTag.color}
                    backgroundColor={quesTag.backgroundColor}>
                    {quesTag.title}
                  </WsTag>
                </WsFlex>
              </View>
              {isFocus && (
                <WsFlex
                  style={{
                    marginTop: 8
                  }}>
                  <WsTag>{t('重點關注')}</WsTag>
                </WsFlex>
              )}
            </WsFlex>
          </WsFlex>
        </TouchableOpacity>
      )}
    </>
  )
}

export default LlAuditQuestionCard001
