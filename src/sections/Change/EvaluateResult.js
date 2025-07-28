import React from 'react'
import { View, Pressable, Image, FlatList } from 'react-native'
import {
  WsInfo,
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsState,
  WsLoading,
  LlChangeResultCard001,
  WsTag,
  WsEmpty,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import S_ChangeVersion from '@/services/api/v1/change_version'
import moment from 'moment'
import i18next from 'i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

const ChangeEvaluateResult = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { versionId } = props

  // State
  const [pickerValue, setPickerValue] = React.useState('all')
  const pickerItems = [
    { label: i18next.t('全部'), value: 'all' },
    { label: i18next.t('不同意'), value: 18 },
    { label: i18next.t('有條件同意'), value: 17 },
    { label: i18next.t('無條件同意'), value: 16 },
  ]
  const [answersHasChangeItems, setAnswersHasChangeItems] = React.useState([])
  const [pickerNum, setPickerNum] = React.useState()
  const [changeVersion, setChangeVersion] = React.useState()
  const [loading, setLoading] = React.useState(true)

  // Services
  // 取得變動計畫表版本
  const $_fetchChangeVersion = async () => {
    const res = await S_ChangeVersion.show({
      modelId: versionId
    })
    setChangeVersion(res)
  }
  // 取得變動作業紀錄
  const $_fetchChangeAnswers = async () => {
    const _params = {
      get_all: 1,
      approve_score: pickerValue === 'all' ? null : pickerValue,
      change_version: versionId
    }
    const res = await S_ChangeRecordAns.index({
      params: _params
    })
    // 目前全部的評估結果
    const _ans = await S_ChangeRecordAns.getAnswersWithSystemClasses(
      res.data,
      versionId,
      pickerValue === 'all' ? 'all' : pickerValue
    )
    setAnswersHasChangeItems(_ans)
    setLoading(false)
    $_setTabNum(_ans)
  }
  const $_setTabNum = _AnsHasChangeItems => {
    const _tabNum = S_ChangeRecordAns.getChangeItemsTabsNum(_AnsHasChangeItems)
    setPickerNum(_tabNum)
  }

  // HELPER
  function findItemByValue(valueToFind) {
    return pickerItems.find(item => item.value === valueToFind);
  }

  React.useEffect(() => {
    $_fetchChangeAnswers()
  }, [pickerValue])

  return (
    <>
      <WsPaddingContainer
        style={{
          paddingBottom: 0,
        }}>
        <WsState
          pickerNum={pickerNum ? pickerNum : '0'}
          placeholder={pickerItems[0].label}
          borderColor={$color.white}
          borderWidth={0}
          style={{
            backgroundColor: $color.white,
            borderRadius: 10
          }}
          type="picker"
          items={pickerItems}
          value={pickerValue}
          loading={loading}
          onChange={$event => {
            setLoading(true)
            setPickerValue($event)
          }}
        />
      </WsPaddingContainer>
      {!loading &&
        answersHasChangeItems &&
        answersHasChangeItems.length > 0 && pickerNum !== 0 ? (
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            borderRadius: 10,
            margin: 16,
            marginBottom: 100,
          }}>
          <FlatList
            data={answersHasChangeItems}
            keyExtractor={(item, index) => index}
            renderItem={({ item: changeItem, index: changeItemIndex }) => {
              return (
                <View key={changeItemIndex}>
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
                            {t(changeItem.name)}
                          </WsText>
                          <WsText letterSpacing={1} size={14}>
                            {changeItem.description}
                          </WsText>
                        </View>
                      </WsFlex>
                    </WsPaddingContainer>
                    <FlatList
                      data={changeItem.system_subclasses}
                      renderItem={({ item: subClass, index: subClassIndex }) => {
                        return (
                          <View key={`subclass${subClassIndex}`}>
                            <>
                              <WsFlex
                                style={{
                                  marginTop: 8,
                                  // borderWidth: 1,
                                }}
                                flexWrap='wrap'
                                alignItems={'center'}
                              >
                                <WsText
                                  size={14}
                                  fontWeight="600"
                                  letterSpacing={1}
                                  style={{
                                    marginRight: 8,
                                    // borderWidth:1,
                                  }}>
                                  {i18next.t('評估領域')}
                                </WsText>
                                <WsTag
                                  key={subClass.id}
                                  img={subClass.icon}
                                  style={{
                                    marginRight: 8,
                                    marginTop: 4,
                                  }}>
                                  {i18next.t(subClass.name)}
                                </WsTag>
                              </WsFlex>

                              {subClass.assignment && (
                                <>
                                  <WsInfo
                                    labelWidth={100}
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center'
                                    }}
                                    label={i18next.t('評估人員')}
                                    type="user"
                                    isUri={true}
                                    value={subClass.assignment.evaluator}
                                  />
                                  <WsInfo
                                    labelWidth={100}
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      marginTop: 8,
                                      paddingBottom: 8,
                                      borderBottomWidth: 0.4,
                                      borderBottomColor: $color.primary,
                                    }}
                                    label={i18next.t('評估日')}
                                    type="date"
                                    value={subClass.assignment.evaluate_at
                                      ? subClass.assignment.evaluate_at
                                      : null}
                                  />
                                </>
                              )}
                              <FlatList
                                data={subClass.risks}
                                renderItem={({ item: risk, index: riskIndex }) => {
                                  return (
                                    <View style={{}} key={`risk${riskIndex}`}>
                                      <LlChangeResultCard001
                                        no={risk && risk.last_version ? risk.last_version.question_number : ''}
                                        text={risk.last_version.name}
                                        score={
                                          risk.answer
                                            ? risk.answer.approve_score
                                            : null
                                        }
                                        style={{
                                          borderBottomWidth: 0.4,
                                          borderBottomColor: $color.primary,
                                          marginRight: 16
                                        }}
                                        risk={risk}
                                      />
                                    </View>
                                  )
                                }}
                                keyExtractor={(item, index) => item + index}
                              />
                            </>
                          </View>
                        )
                      }}
                      keyExtractor={(item, index) => item + index}
                    />
                  </>
                </View>
              )
            }}
          />

        </WsPaddingContainer>
      ) : (
        <>
          {loading ? (
            <WsLoading style={{ padding: 16 }}></WsLoading>
          ) : (
            <WsEmpty emptyTitle={pickerValue ? t(`目前沒有 ${findItemByValue(pickerValue).label} 項目`) : ''} emptyText=""></WsEmpty>
          )
          }
        </>
      )}
    </>
  )
}

export default ChangeEvaluateResult
