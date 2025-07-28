import React from 'react'
import { Pressable, ScrollView, View, Image } from 'react-native'
import {
  WsTabView,
  WsIconTitleCircle,
  WsPaddingContainer,
  WsFlex,
  WsTag,
  WsText,
  WsInfo,
  WsStateFormModal,
  LlChangeResultHeader,
  LlChangeResultCard001,
  WsState,
  WsSkeleton
} from '@/components'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import fields from '@/models/change_record_answer'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_ChangeVersion from '@/services/api/v1/change_version'

const ChangeAssignmentOtherResultShow = ({ route }) => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    evaluator,
    changeVersionId,
    system_subclass,
  } = route.params

  // redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [loading, setLoading] = React.useState(true)
  const [result, setResult] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)
  const [modelsValue, setModelsValue] = React.useState({})
  const [changeVersion, setChangeVersion] = React.useState()

  // Services
  const $_fetchResult = async () => {
    const _res = await S_ChangeVersion.show({
      modelId: changeVersionId
    })
    setChangeVersion(_res)
    const allChangeVersion = await S_ChangeRecordAns.index({
      params: {
        get_all: 1,
        change_version: changeVersionId,
        system_subclass: system_subclass.id
      }
    })
    const res = await S_ChangeRecordAns.getAnswerForResult(
      allChangeVersion.data,
      changeVersionId,
      evaluator,
      system_subclass
    )
    const resWithCount = S_ChangeRecordAns.countResultNum(res)
    setResult(resWithCount)
    setLoading(false)
  }

  const $_putAnswer = async data => {
    setLoading(true)
    const _data = {
      description: data.description,
      approve_score: data.approve_score,
      // attaches: data.attaches,
      attaches: data.file_attaches && data.file_attaches.length > 0 ? S_ChangeRecordAns.formattedForFileStore(data.file_attaches) : [],
    }
    const res = await S_ChangeRecordAns.update({
      data: _data,
      modelId: modelsValue.answer.id
    })
    $_fetchResult()
  }

  // Function
  const $_hasChangeRiskInSystemSubclass = systemSubclass => {
    if (systemSubclass.risks && systemSubclass.risks.length != 0) {
      return true
    } else {
      return false
    }
  }
  const $_hasChangeRiskInItem = item => {
    let _hasRisk = false
    if (item.system_subclasses) {
      item.system_subclasses.forEach(subClass => {
        if ($_hasChangeRiskInSystemSubclass(subClass)) {
          _hasRisk = true
        }
      })
    }
    return _hasRisk
  }
  const $_hasRiskResultAnswer = item => {
    let _hasAnswer = false
    if (item.system_subclasses) {
      item.system_subclasses.forEach(subClass => {
        subClass.risks.forEach(risk => {
          if (risk.answer && risk.answer.length > 0) {
            _hasAnswer = true
          }
        })
      })
    }
    return _hasAnswer
  }

  const $_setModelsValue = (risk, changeItemName, changeItemDescription) => {
    const _value = {
      ...risk,
      ...risk.last_version,
      changeItemName,
      changeItemDescription
    }
    setModelsValue(_value)
  }

  const $_onSubmit = $event => {
    setStateModal(false)
    $_putAnswer($event)
  }

  React.useEffect(() => {
    $_fetchResult()
  }, [])

  return (
    <ScrollView>
      {result && !loading ? (
        <>
          <LlChangeResultHeader result={result} />
          <WsPaddingContainer style={{ backgroundColor: $color.white }}>
          {changeVersion.version_number && (
              <WsInfo
                labelWidth={80}
                label={t('版本')}
                style={{
                  marginTop: 4,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                value={`Ver.${changeVersion.version_number}`}
              />
            )}
            <WsInfo
              labelWidth={80}
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
              label={i18next.t('評估人員')}
              type="user"
              isUri={true}
              value={result.evaluator}
            />
            <WsFlex
              style={{
              }}
              alignItems={'center'}
            >
              <WsText size={14} fontWeight="600" style={{ width: 88 }}>
                {i18next.t('評估領域')}
              </WsText>
              <WsTag
                key={system_subclass.id}
                img={system_subclass.icon}
                style={{
                  marginRight: 8,
                  marginTop: 4
                }}>
                {i18next.t(system_subclass.name)}
              </WsTag>
            </WsFlex>
            <WsInfo
              labelWidth={80}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4
              }}
              label={i18next.t('評估日')}
              type="date"
              value={result.evaluate_at}
            />
            {changeVersion.file_attaches && changeVersion.file_attaches.length > 0 && (
              <WsInfo
                labelWidth={80}
                style={{
                  top: 8,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
                label={t('附件')}
                type='filesAndImages'
                value={changeVersion.file_attaches ? changeVersion.file_attaches : null}
              />
            )}
          </WsPaddingContainer>
          <WsPaddingContainer>
            {result.answers.map((changeItem, changeItemIndex) => {
              return (
                <View key={`changeItem${changeItemIndex}`} style={{ marginTop: 16 }}>
                  {$_hasChangeRiskInItem(changeItem) && (
                    <>
                      <WsText
                        letterSpacing={1}
                        fontWeight="700"
                        style={{
                          marginBottom: 16,
                        }}
                      >
                        {changeItem._sequence}{'.'}{changeItem.name}
                      </WsText>
                      <WsText
                        letterSpacing={1}
                        size={14}
                        style={{ marginBottom: 16 }}>
                        {changeItem.description}
                      </WsText>
                      {changeItem.system_subclasses.map(
                        (subClass, subClassIndex) => {
                          return (
                            <View key={`subclass${subClassIndex}`}>
                              {$_hasChangeRiskInSystemSubclass(subClass) && (
                                <>
                                  {subClass.risks && (
                                    <>
                                      {subClass.risks.map((risk, riskIndex) => {
                                        return (
                                          <View
                                            style={{}}
                                            key={`risk${riskIndex}`}>
                                            <LlChangeResultCard001
                                              disabled={currentUser && currentUser.id != evaluator ? true : false}
                                              risk={risk}
                                              style={{
                                                marginBottom: 8,
                                                borderRadius: 10,
                                              }}
                                              text={risk.last_version.name}
                                              score={
                                                risk.answer
                                                  ? risk.answer.approve_score
                                                  : null
                                              }
                                              no={`${risk.question_number}`}
                                              onPress={() => {
                                                $_setModelsValue(
                                                  risk,
                                                  changeItem.name,
                                                  changeItem.description
                                                )
                                                setStateModal(true)
                                              }}
                                            />
                                          </View>
                                        )
                                      })}
                                    </>
                                  )}
                                </>
                              )}
                            </View>
                          )
                        }
                      )}
                    </>
                  )}
                </View>
              )
            })}
          </WsPaddingContainer>

          <WsStateFormModal
            footerDisable={result.evaluator.id === currentUser.id ? false : true}
            fields={fields.getFields(result.evaluator.id)}
            initValue={fields.getInitValue(modelsValue) ? fields.getInitValue(modelsValue) : modelsValue}
            visible={stateModal}
            onClose={() => {
              setStateModal(false)
            }}
            onSubmit={$event => {
              $_onSubmit($event)
            }}
            modalBackgroundColor={$color.primary11l}
            formViewBackgroundColor={$color.primary11l}
            footerBtnRightText={t('儲存')}
          />
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </ScrollView>
  )
}

export default ChangeAssignmentOtherResultShow
