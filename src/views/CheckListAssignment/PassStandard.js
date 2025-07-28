import React from 'react'
import { ScrollView, View } from 'react-native'
import {
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsInfoImage,
  WsLoading
} from '@/components'
import { LlInfoContainer001, LlIconCard001 } from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'

const CheckListPassStandard = (props) => {
  const { t, i18n } = useTranslation()

  // Props
  const { id } = props

  // STATE
  const [loading, setLoading] = React.useState(true)
  const [question, setQuestion] = React.useState()

  // SERVICE
  const $_getQuestion = async () => {
    setLoading(true)
    try {
      const res = await S_CheckListQuestion.show({
        modelId: id
      })
      if (res) {
        setQuestion(res)
      }
      setLoading(false)
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }

  React.useEffect(() => {
    $_getQuestion()
  }, [id])

  // console.log(JSON.stringify(question),'question--');

  return (
    <>
      <ScrollView>
        {question && !loading ? (
          <>
            {question &&
              question.control_limit_lower &&
              question.control_limit_upper && (
                <LlInfoContainer001
                  style={{
                    marginTop: 8
                  }}>
                  <WsInfo
                    label={t('Control Limit（管制界線）')}
                    type="text"
                    value={`${question.control_limit_lower}~${question.control_limit_upper}`}
                    style={{
                      marginVertical: 12
                    }}
                  />
                  <WsInfo
                    label={t('Spec Limit (合規界線)')}
                    type="text"
                    value={`${question.spec_limit_lower}~${question.spec_limit_upper}`}
                  />
                  <WsFlex
                    style={{
                      marginTop: 16
                    }}
                  />
                </LlInfoContainer001>
              )}


            <LlInfoContainer001
              style={{
                marginTop: 8
              }}>
              {question &&
                question.last_version &&
                question.last_version.remark ? (
                <WsInfo
                  style={{
                    marginTop: 8
                  }}
                  label={t('合規標準')}
                  value={
                    question.last_version.remark
                      ? question.last_version.remark
                      : t('無')
                  }
                />
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <WsText>{t('無合規標準')}</WsText>
                  </View>
                </>
              )}

              {question &&
                question.last_version &&
                question.last_version.images &&
                question.last_version.images.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.images}
                  />
                )}

              {question &&
                question.last_version &&
                question.last_version.file_images &&
                question.last_version.file_images.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.file_images}
                  />
                )}

              {question &&
                question.last_version &&
                question.last_version.attaches &&
                question.last_version.attaches.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.attaches}
                  />
                )}

              {question &&
                question.last_version &&
                question.last_version.file_attaches &&
                question.last_version.file_attaches.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.file_attaches}
                  />
                )}

              {question &&
                question.last_version &&
                question.last_version.template_images &&
                question.last_version.template_images.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.template_images}
                  />
                )}

              {question &&
                question.last_version &&
                question.last_version.template_attaches &&
                question.last_version.template_attaches.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.template_attaches}
                  />
                )}

            </LlInfoContainer001>
          </>
        ) : (
          <WsLoading
            style={{
              padding: 16
            }}
          ></WsLoading>
        )}
      </ScrollView>
    </>
  )
}

export default CheckListPassStandard
