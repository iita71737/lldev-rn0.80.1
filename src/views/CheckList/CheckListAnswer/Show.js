import React from 'react'
import { ScrollView, View } from 'react-native'
import {
  LlInfoContainer001,
  LlIconCard001,
  WsIcon,
  WsIconBtn,
  LlRelatedGuidelineItem001,
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsInfoImage
} from '@/components'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_url from '@/__reactnative_stone/services/app/url'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const CheckListAnswerShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { id, apiAlertId } = route.params

  // State
  const [checkListAnswer, setCheckListAnswer] = React.useState(null)

  // Services
  const $_fetchCheckListAnswer = async () => {
    const res = await S_CheckListRecordAns.show({
      modelId: id
    })
    setCheckListAnswer(res)
  }
  // Function
  const $_getSpecLimitAttaches = () => {
    const attaches = []
    if (checkListAnswer) {
      if (
        checkListAnswer.template_attaches &&
        checkListAnswer.template_attaches.length != 0
      ) {
        checkListAnswer.template_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      } else if (
        checkListAnswer.attaches &&
        checkListAnswer.attaches.length != 0
      ) {
        checkListAnswer.attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      } else {
        return null
      }
    }
  }
  const $_getOcapAttaches = () => {
    const attaches = []
    if (checkListAnswer) {
      if (
        checkListAnswer.ocap_attaches &&
        checkListAnswer.ocap_attaches.length != 0
      ) {
        checkListAnswer.ocap_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      } else {
        return null
      }
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => (
        <WsIconBtn
          name={'md-arrow-back'}
          color="white"
          size={24}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            if (apiAlertId) {
              navigation.navigate({
                name: 'AlertShow',
                params: {
                  id: apiAlertId
                }
              })
            } else {
              navigation.goBack()
            }
          }}
        />
      )
    })
  }

  React.useEffect(() => {
    $_fetchCheckListAnswer()
    $_setNavigationOption()
  }, [])

  return (
    <>
      {checkListAnswer && (
        <ScrollView>
          <LlInfoContainer001>
            <WsInfo label={t('標題')} value={checkListAnswer.title} />
            {checkListAnswer.keypoint == 1 && (
              <WsFlex>
                <WsTag
                  style={{
                    marginTop: 16
                  }}>
                  {t('重點關注')}
                </WsTag>
              </WsFlex>
            )}
          </LlInfoContainer001>
          {checkListAnswer.question_type == 1 && (
            <LlInfoContainer001
              style={{
                marginTop: 8
              }}>
              <WsText size={14}>{t('觀測值')}</WsText>
              <WsFlex>
                <WsIcon name="ws-filled-info" size={22} />
                <WsText>{checkListAnswer.score}</WsText>
              </WsFlex>
              <WsInfo
                label={`Control Limit（${t('管制界線')}）`}
                type="text"
                value={`${checkListAnswer.control_limit_lower} - ${checkListAnswer.control_limit_upper}`}
                style={{
                  marginVertical: 12
                }}
              />
              <WsInfo
                label={`${t('Spec Limit (合規界線)')}`}
                type="text"
                value={`${checkListAnswer.spec_limit_lower} - ${checkListAnswer.spec_limit_upper}`}
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
            <WsInfo
              label={t('備註')}
              value={checkListAnswer.remark ? checkListAnswer.remark : t('無')}
            />
            {$_getSpecLimitAttaches() && (
              <WsInfo
                type="files"
                style={{
                  marginTop: 8
                }}
                value={$_getSpecLimitAttaches()}
              />
            )}
          </LlInfoContainer001>
          <LlInfoContainer001
            style={{
              marginTop: 8
            }}>
            <WsInfo
              label="OCAP"
              value={
                checkListAnswer.ocap_remark
                  ? checkListAnswer.ocap_remar
                  : t('無')
              }
            />
            {$_getOcapAttaches() && (
              <WsInfo
                type="files"
                style={{
                  marginTop: 8
                }}
                value={$_getOcapAttaches()}
              />
            )}
          </LlInfoContainer001>
        </ScrollView>
      )}
    </>
  )
}

export default CheckListAnswerShow
