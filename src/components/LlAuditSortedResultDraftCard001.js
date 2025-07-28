import React, { useEffect, useCallback, useMemo } from 'react'
import {
  Pressable,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsIcon,
  WsCard,
  WsInfo,
  WsCollapsible,
  WsLoading,
  WsPaddingContainer,
  LlRelatedGuidelineItem001
} from '@/components'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_AuditQuestion from '@/services/api/v1/audit_question'

const LlAuditSortedResultDraftCard001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    no,
    title,
    style,
    score,
    remark,
    onPress,
    backgroundColor = $color.white,
    isFocus = false,
    id,
    item,
    testID,
  } = props

  // State
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
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [question, setQuestion] = React.useState()
  const [loading, setLoading] = React.useState(true)

  // Function
  const $_validation = (score, remark) => {
    if (score && (score.value == 25 || (score.value != 25 && remark))) {
      return false
    } else {
      return true
    }
  }

  // helper
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }
  // SERVICES
  const fetchQuestion = useCallback(async () => {
    if (item?.id) {
      try {
        const res = await S_AuditQuestion.show(item.id);
        if (res) {
          setQuestion(res);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }, [item?.id]);

  useEffect(() => {
    if (!isCollapsed) {
      fetchQuestion();
    }
  }, [isCollapsed, fetchQuestion])

  const $_setStyle = () => {
    for (let riskKey in riskStandard) {
      if (score?.value == riskStandard[riskKey].score) {
        setQuesTag(riskStandard[riskKey])
      }
    }
  }

  React.useEffect(() => {
    $_setStyle()
  }, [score])

  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={style}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        <WsCard
          padding={0}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
          color={($_validation(score, remark) === false) ? $color.white : $color.danger11l}
        >
          <WsFlex
            alignItems="flex-start"
            style={[
              {
              },
              style
            ]}>
            <WsFlex flexDirection="row" alignItems="flex-start">
              <WsText
                fontWeight="bold"
                size={14}
                style={{
                  width: 60
                }}>
                {no}
              </WsText>
              <View
                style={{
                  flex: 1,
                }}>
                {title && (
                  <WsText
                    fontWeight="bold"
                    size={14}
                    style={{
                    }}
                  >
                    {title}
                  </WsText>
                )}

                {$_validation(score, remark) && (
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsIcon name={'md-info-outline'} size={16} color={$color.danger} />
                    <WsText
                      style={{
                        marginLeft: 8
                      }}
                      color={$color.danger}
                      size={12}>
                      {t('必填資料尚未填寫完整')}
                    </WsText>
                  </WsFlex>
                )}

                {quesTag && (
                  <WsTag
                    style={{
                      paddingLeft: 0
                    }}
                    size={12}
                    icon={quesTag.icon}
                    borderRadius={20}
                    textColor={quesTag.textColor}
                    iconColor={quesTag.color}
                    backgroundColor={'transparent'}
                  >
                    {quesTag.title}
                  </WsTag>
                )}

                {$_validation(score, remark) && (
                  <WsFlex>
                    <WsIcon name={'ws-outline-edit-pencil'} size={16} color={$color.danger} />
                    <WsText
                      style={{
                        marginLeft: 8
                      }}
                      color={$color.danger}
                      size={12}>
                      {t('尚未填寫備註')}
                    </WsText>
                  </WsFlex>
                )}

              </View>
              <View
                style={{
                  flexDirection: 'column',
                }}>
                {isFocus && (
                  <WsFlex
                    style={{
                    }}>
                    <WsTag>{t('重點關注')}</WsTag>
                  </WsFlex>
                )}
                {(
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}>
                    <TouchableOpacity
                      onPress={onPress}
                    >
                      <WsTag
                        backgroundColor={$color.danger10l}
                        textColor={$color.danger}>
                        {t('前往答題頁')}
                      </WsTag>
                    </TouchableOpacity>
                  </WsFlex>
                )}
              </View>
            </WsFlex>
          </WsFlex>

          <WsCollapsible isCollapsed={isCollapsed}>
            {loading ? (
              <WsLoading type="b" ></WsLoading>
            ) : (
              <>
                {item.remark && (
                  <WsInfo
                    style={{
                      marginTop: 8
                    }}
                    label={t('備註')}
                    value={item.remark ? item.remark : t('無')}
                  />
                )}

                {item.images && item.images.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 8,
                    }}
                    // label={t('相關圖片附件')}
                    type="filesAndImages"
                    value={item.images}
                  >
                  </WsInfo>
                )}

                {question.last_version?.images && question.last_version?.images.length > 0 && (
                  <WsFlex
                    style={{
                      width: width,
                      marginTop: 8,
                    }}
                  >
                    <WsInfo
                      style={{
                        marginTop: 8,
                      }}
                      label={t('相關圖片')}
                      type="filesAndImages"
                      value={question.last_version?.images}>
                    </WsInfo>
                  </WsFlex>
                )}

                {question.last_version?.file_images && question.last_version?.file_images.length > 0 && (
                  <WsFlex
                    style={{
                      width: width,
                      marginTop: 8,
                    }}
                  >
                    <WsInfo
                      style={{
                        marginTop: 8,
                      }}
                      label={t('相關圖片')}
                      type="filesAndImages"
                      value={question.last_version?.file_images}>
                    </WsInfo>
                  </WsFlex>
                )}

                {((question.last_version?.article_versions &&
                  question.last_version?.article_versions.length != 0) ||
                  (question.last_version?.article_versions &&
                    question.last_version?.article_versions.length != 0)) && (
                    <WsFlex
                      style={{
                        marginTop: 8,
                      }}>
                      <WsText
                        style={{
                          marginRight: 16,
                        }}
                        size={14}
                        fontWeight={'600'}
                      >
                        {t('法規依據')}
                      </WsText>
                    </WsFlex>
                  )}
                {question &&
                  question.last_version &&
                  question.last_version?.act_version_alls &&
                  question.last_version?.act_version_alls.length != 0 && (
                    <>
                      {question.last_version?.act_version_alls.map(
                        (article, articleIndex) => {
                          return (
                            <WsInfo
                              style={{
                                marginTop: 8,
                              }}
                              type="link"
                              value={
                                article.name
                              }
                              onPress={() => {
                                navigation.push('RoutesAct', {
                                  screen: 'ActShow',
                                  params: {
                                    id: article.act.id,
                                  }
                                })
                              }}
                            />
                          )
                        }
                      )}
                    </>
                  )}

                {question &&
                  question.last_version &&
                  question.last_version.article_versions &&
                  question.last_version.article_versions.length > 0 && (
                    <>
                      {question.last_version.article_versions.map((article, articleIndex) => {
                        return (
                          <>
                            <TouchableOpacity
                              onPress={() => {
                                setStateModal(true)
                                setSelectVersionId(article.id)
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center'
                                }}>
                                <WsInfo
                                  type="link"
                                  value={$_setArticleText(article)}
                                  style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 4
                                  }}
                                  onPress={() => {
                                    setStateModal(true)
                                    setSelectVersionId(article.id)
                                  }}
                                />
                              </View>
                            </TouchableOpacity>
                          </>
                        )
                      })}
                    </>
                  )}

                {(question &&
                  question.last_version &&
                  question.last_version.related_guidelines &&
                  question.last_version.related_guidelines.length > 0) && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        marginTop: 8,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <WsText size={14} fontWeight={'600'} style={{ marginBottom: 8 }}>
                          {t('相關內規')}
                        </WsText>
                      </View>
                      {question &&
                        question.last_version &&
                        question.last_version.related_guidelines &&
                        question.last_version.related_guidelines.length > 0 && (
                          <>
                            <FlatList
                              style={{
                              }}
                              data={question.last_version.related_guidelines}
                              keyExtractor={item => item.id}
                              renderItem={({ item, index }) => {
                                return (
                                  <LlRelatedGuidelineItem001
                                    key={index}
                                    item={item}
                                  />
                                );
                              }}
                              ListEmptyComponent={() => {
                                return (
                                  <WsEmpty />
                                )
                              }}
                            />
                          </>
                        )}
                    </WsPaddingContainer>
                  )}

              </>
            )}
          </WsCollapsible>

        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlAuditSortedResultDraftCard001
