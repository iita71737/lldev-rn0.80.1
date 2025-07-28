import React from 'react'
import { View, Pressable } from 'react-native'
import {
  WsInfoForm,
  WsFlex,
  WsInfo,
  WsPaddingContainer,
  WsModal,
  WsVersionHistory,
  LlBtn002,
  WsText,
  WsTag,
  WsLoading,
  LlChangeResultCard001,
  WsEmpty
} from '@/components'
import S_Change from '@/services/api/v1/change'
import S_ChangeVersion from '@/services/api/v1/change_version'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import $color from '@/__reactnative_stone/global/color'
import changeFields from '@/models/change'
import moment from 'moment'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

const ChangePlanData = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { versionId } = props

  // State
  const [change, setChange] = React.useState()
  const [loading, setLoading] = React.useState(true)

  const [answersHasChangeItems, setAnswersHasChangeItems] = React.useState()
  const [pickerValue, setPickerValue] = React.useState('all')
  const [changeItemLoading, setChangeItemLoading] = React.useState(true)

  const [infoValue, setInfoValue] = React.useState({})
  const [infoFields, setInfoFields] = React.useState({})

  // Services
  const $_fetchChange = async () => {
    // change version
    const res = await S_ChangeVersion.show({
      modelId: versionId
    })
    setChange(res)
    setLoading(false)
  }

  const $_fetchChangeItems = async () => {
    if (change.change_items && change.change_items.length > 0) {
      // 取得變動作業紀錄
      const _params = {
        get_all: 1,
        approve_score: pickerValue === 'all' ? null : pickerValue,
        change_version: versionId
      }
      const _res = await S_ChangeRecordAns.index({
        params: _params
      })
      // 目前全部的評估結果
      const _ans = await S_ChangeRecordAns.getAnswersWithSystemClasses(
        _res.data,
        versionId,
        pickerValue === 'all' ? 'all' : pickerValue
      )
      setAnswersHasChangeItems(_ans)
    }
    setChangeItemLoading(false)
  }

  // Function
  const $_setInfoData = () => {
    setInfoFields({
      version_number: {
        label: i18next.t('版本')
      },
      created_at: {
        label: i18next.t('建立日期')
      },
      expired_date: {
        label: i18next.t('到期日')
      }
    }),
      setInfoValue({
        version_number: `ver.${change.version_number}`,
        created_at: change.created_at
          ? moment(change.created_at).format('YYYY-MM-DD')
          : '無',
        expired_date: moment(change.expired_date).format('YYYY-MM-DD')
      })
  }

  React.useEffect(() => {
    setLoading(true)
    setChangeItemLoading(true)
    $_fetchChange()
  }, [versionId])

  React.useEffect(() => {
    if (change) {
      $_fetchChangeItems()
      $_setInfoData()
    }
  }, [change])

  return (
    <>
      {change && !loading ? (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.primary11l,
              marginVertical: 16
            }}>
            <WsInfo
              type="user"
              value={change.owner}
              isUri={true}
              label={i18next.t('負責人')}
            />
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.primary11l,
              paddingBottom: 0
            }}>
            <WsInfoForm
              style={{
                marginBottom: 8
              }}
              value={infoValue}
              fields={infoFields}
            />
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.primary11l,
              paddingBottom: 0
            }}>
            {change.attaches.length > 0 && (
              <WsInfo
                type="files"
                value={change.attaches}
                label={i18next.t('附件')}
              />
            )}
          </WsPaddingContainer>

          {!changeItemLoading &&
            answersHasChangeItems &&
            answersHasChangeItems.length > 0 ? (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                borderRadius: 10,
                margin: 16
              }}>
              {answersHasChangeItems.map((changeItem, changeItemIndex) => {
                return (
                  <View key={`changeItem${changeItemIndex}`}>
                    <>
                      <WsPaddingContainer
                        style={{
                          backgroundColor: $color.primary11l,
                          borderRadius: 10,
                          marginTop: changeItemIndex !== 0 ? 16 : 0
                        }}>
                        <WsFlex alignItems="flex-start">
                          <WsText
                            letterSpacing={1}
                            size={18}
                            style={{ marginRight: 4 }}
                            fontWeight={'600'}>
                            {changeItemIndex + 1}
                            {'.'}
                          </WsText>
                          <View>
                            <WsText
                              letterSpacing={1}
                              fontWeight="700"
                              style={{
                                marginRight: 16,
                                marginBottom: 4
                              }}>
                              {changeItem.name}
                            </WsText>
                            <WsText letterSpacing={1} size={14}>
                              {changeItem.description}
                            </WsText>
                          </View>
                        </WsFlex>
                      </WsPaddingContainer>
                      {changeItem.system_subclasses &&
                        changeItem.system_subclasses.map(
                          (subClass, subClassIndex) => {
                            return (
                              <View key={`subclass${subClassIndex}`}>
                                <>
                                  <WsFlex style={{ marginVertical: 16 }}>
                                    <WsText
                                      size={14}
                                      fontWeight="700"
                                      style={{
                                        marginRight: 8
                                      }}>
                                      {i18next.t('評估領域')}
                                    </WsText>
                                    <WsTag
                                      key={subClass.id}
                                      img={subClass.icon}
                                      style={{
                                        backgroundColor: $color.primary11l
                                      }}>
                                      <WsText size={14} fontWeight="700">
                                        {subClass.name}
                                      </WsText>
                                    </WsTag>
                                  </WsFlex>
                                  {subClass.assignment && (
                                    <>
                                      <WsFlex style={{ marginBottom: 16 }}>
                                        <WsText
                                          size={14}
                                          fontWeight="700"
                                          style={{
                                            marginRight: 16
                                          }}>
                                          {i18next.t('評估人員')}
                                        </WsText>
                                        <WsInfo
                                          style={{}}
                                          type="user"
                                          value={subClass.assignment.evaluator}
                                          isUri={true}
                                        />
                                      </WsFlex>
                                      <WsFlex style={{ marginBottom: 16 }}>
                                        <WsText
                                          size={14}
                                          fontWeight="700"
                                          style={{
                                            marginRight: 16
                                          }}>
                                          {i18next.t('評估日')}
                                        </WsText>
                                        <WsText
                                          size={14}
                                          fontWeight="700"
                                          style={{
                                            marginRight: 16
                                          }}>
                                          {subClass.assignment.evaluate_at
                                            ? moment(
                                              subClass.assignment.evaluate_at
                                            ).format('YYYY-MM-DD')
                                            : '無'}
                                        </WsText>
                                      </WsFlex>
                                    </>
                                  )}
                                  {subClass.risks && (
                                    <>
                                      {subClass.risks.map((risk, riskIndex) => {
                                        return (
                                          <View
                                            style={{}}
                                            key={`risk${riskIndex}`}>
                                            <LlChangeResultCard001
                                              no={
                                                risk && risk.last_version
                                                  ? risk.last_version
                                                    .question_number
                                                  : ''
                                              }
                                              text={risk.last_version.name}
                                              score={
                                                risk.answer
                                                  ? risk.answer.approve_score
                                                  : null
                                              }
                                              style={{
                                                borderBottomWidth: 0.4,
                                                borderBottomColor:
                                                  $color.primary,
                                                marginRight: 16
                                              }}
                                              risk={risk}
                                            />
                                          </View>
                                        )
                                      })}
                                    </>
                                  )}
                                </>
                              </View>
                            )
                          }
                        )}
                    </>
                  </View>
                )
              })}
            </WsPaddingContainer>
          ) : (
            <>
              {changeItemLoading ? (
                <WsLoading style={{ padding: 16 }} />
              ) : (
                <WsEmpty emptyText={''} emptyTitle={'無相關變動項目'} />
              )}
            </>
          )}
        </>
      ) : (
        <WsLoading />
      )}
    </>
  )
}

export default ChangePlanData
