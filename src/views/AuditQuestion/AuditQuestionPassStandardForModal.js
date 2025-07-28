import React from 'react'
import { ScrollView, View } from 'react-native'
import { WsFlex, WsText, WsPaddingContainer, WsInfo, WsLoading } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'

const AuditQuestionPassStandardForModal = props => {
  const { t, i18n } = useTranslation()

  //Params
  const { versionId } = props

  // State
  const [loading, setLoading] = React.useState(true)
  const [questionVersion, setQuestionVersion] = React.useState()

  // Services
  const $_fetchApi = async () => {
    try {
      const res = await S_AuditQuestionVersion.show(versionId)
      setQuestionVersion(res)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchApi()
  }, [versionId])

  return (
    <ScrollView>
      {questionVersion && !loading ? (
        <>
          <WsPaddingContainer style={{ backgroundColor: $color.white }}>
            <WsFlex flexWrap="wrap">
              <WsText size={14} style={{ marginLeft: 8, paddingVertical: 8 }}>{t(questionVersion.remark)}</WsText>
            </WsFlex>
          </WsPaddingContainer>
        </>
      ) : (
        <WsLoading></WsLoading>
      )}
    </ScrollView>
  )
}

export default AuditQuestionPassStandardForModal
