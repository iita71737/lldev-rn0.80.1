import React from 'react'
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native'
import {
  LlInfoContainer001,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsText,
  WsIcon,
  WsModal,
  WsHtmlRender,
  WsLoading,
  LlRelatedGuidelineItem001
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { WsPreviewImage001 } from '@/components/seed'
import gColor from '@/__reactnative_stone/global/color'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'
import { LlChecklistGeneralScheduleListCard001 } from '@/components'
import S_AuditQuestionTemplateVersion from '@/services/api/v1/audit_question_template_version'


const AuditQuestionShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // props
  const {
    question,
    templateAPI
  } = route.params

  // States
  const [loading, setLoading] = React.useState(true)
  const [questionVersion, setQuestionVersion] = React.useState()

  const [selectVersionId, setSelectVersionId] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)

  // Services
  const $_fetchApi = async () => {
    if (templateAPI) {
      try {
        const _id = question.last_version?.id
        const res = await S_AuditQuestionTemplateVersion.show(_id)
        setQuestionVersion(res)
      } catch (e) {
        console.error(e);
      }
      setLoading(false)
    } else {
      try {
        const _id = question.id
        const res = await S_AuditQuestionVersion.show(_id)
        setQuestionVersion(res)
      } catch (e) {
        console.error(e);
      }
      setLoading(false)
    }
  }

  React.useEffect(() => {
    $_fetchApi()
  }, [question])

  // Function
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  return (
    <>
      {loading ? (
        <WsLoading
          style={{
            padding: 16
          }}
        ></WsLoading>
      ) : (
        <ScrollView>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white
            }}>
            <WsInfo
              label={t("標題")}
              value={
                question.title
                  ? question.title
                  : question.last_version.title
                    ? question.last_version.title
                    : null
              }
            />
            {questionVersion &&
              questionVersion.keypoint == 1 &&
              questionVersion.audit_question &&
              questionVersion.audit_question.audit_question_template ? (
              <WsFlex style={{ marginTop: 8 }}>
                <WsTag>{t('重點關注')}</WsTag>
              </WsFlex>
            ) :
              questionVersion &&
                questionVersion.keypoint === 0 &&
                questionVersion.audit_question &&
                questionVersion.audit_question.audit_question_template ?
                (
                  <WsFlex style={{ marginTop: 8 }}>
                    <WsTag backgroundColor={$color.gray12l} textColor={$color.gray}>
                      {t('建議題目')}
                    </WsTag>
                  </WsFlex>
                ) : (
                  <WsFlex style={{ marginTop: 8 }}>
                    <WsTag backgroundColor={$color.gray12l} textColor={$color.gray}>
                      {t('自訂題目')}
                    </WsTag>
                  </WsFlex>
                )
            }
          </WsPaddingContainer>

          {/* 來自audit_question_template_version */}
          {questionVersion &&
            questionVersion.audit_question_template_version && (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                {questionVersion.audit_question_template_version &&
                  questionVersion.audit_question_template_version.remark && (
                    <>
                      <WsText size={14} fontWeight={600} style={{ marginBottom: 8 }}>{t('查核提示')}</WsText>
                      <WsHtmlRender content={questionVersion.audit_question_template_version.remark} />
                    </>
                  )}
                {questionVersion.audit_question_template_version &&
                  questionVersion.audit_question_template_version.attaches &&
                  questionVersion.audit_question_template_version.attaches.length > 0 && (
                    <LlInfoContainer001
                      style={{
                        marginTop: 8,
                        padding: 0,
                      }}>
                      {questionVersion.attaches && (
                        <WsInfo
                          type="filesAndImages"
                          value={questionVersion.audit_question_template_version.attaches}
                        />
                      )}
                    </LlInfoContainer001>
                  )}
              </WsPaddingContainer>
            )}

          {(questionVersion &&
            questionVersion.audit_question_template_version &&
            ((questionVersion.audit_question_template_version.article_versions &&
              questionVersion.audit_question_template_version.article_versions.length > 0) ||
              (questionVersion.audit_question_template_version &&
                questionVersion.audit_question_template_version.act_version_alls &&
                questionVersion.audit_question_template_version.act_version_alls.length > 0))) && (
              <LlInfoContainer001
                style={{
                  paddingBottom: 0,
                  marginTop: 8
                }}>
                <View
                  style={{
                    flexDirection: 'row'
                  }}>
                  <WsText size={14} fontWeight={'600'}>
                    {t('法規依據')}
                  </WsText>
                </View>
                {questionVersion &&
                  questionVersion.audit_question_template_version &&
                  questionVersion.audit_question_template_version.act_version_alls &&
                  questionVersion.audit_question_template_version.act_version_alls.length > 0 && (
                    <>
                      {questionVersion.audit_question_template_version.act_version_alls.map(
                        (article, articleIndex) => {
                          return (
                            <WsInfo
                              style={{
                                marginTop: 8
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
                {questionVersion &&
                  questionVersion.audit_question_template_version &&
                  questionVersion.audit_question_template_version.article_versions && (
                    <>
                      {questionVersion.audit_question_template_version.article_versions.map(
                        (article, articleIndex) => {
                          return (
                            <>
                              <TouchableOpacity
                                style={{
                                }}
                                key={articleIndex}
                                onPress={() => {
                                  setStateModal(true)
                                  setSelectVersionId(article.id)
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                  }}>
                                  <WsInfo
                                    type="link"
                                    value={$_setArticleText(article)}
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
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
                        }
                      )}
                    </>
                  )}
              </LlInfoContainer001>
            )}

          {(questionVersion &&
            questionVersion.audit_question_template_version &&
            questionVersion.audit_question_template_version.effects &&
            questionVersion.audit_question_template_version.effects.length > 0) && (
              <LlInfoContainer001
                style={{
                  paddingTop: 8,
                }}>
                {questionVersion &&
                  questionVersion.audit_question_template_version &&
                  questionVersion.audit_question_template_version.effects &&
                  questionVersion.audit_question_template_version.effects.length > 0 && (
                    <WsFlex
                      flexWrap="wrap"
                    >
                      {questionVersion.audit_question_template_version.effects.map(r => (
                        <>
                          <View
                            style={{
                              backgroundColor: $color.danger10l,
                              borderRadius: 10,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 8
                            }}>
                            <WsFlex>
                              <Image
                                style={{
                                  width: 14,
                                  height: 14,
                                  marginRight: 4,
                                }}
                                source={{ uri: r.icon }}
                              />
                              <WsText color={$color.danger} size={12} fontWeight={500}>{r.name}</WsText>
                            </WsFlex>
                          </View>
                        </>
                      ))}
                    </WsFlex>
                  )}

                {questionVersion &&
                  questionVersion.audit_question_template_version &&
                  questionVersion.audit_question_template_version.factory_effects &&
                  questionVersion.audit_question_template_version.factory_effects.length > 0 && (
                    <WsFlex
                      flexWrap="wrap"
                    >
                      {questionVersion.audit_question_template_version.factory_effects.map(r => (
                        <>
                          <View
                            style={{
                              marginTop: 8,
                              backgroundColor: $color.danger10l,
                              borderRadius: 10,
                              paddingHorizontal: 16,
                              paddingVertical: 4,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 8
                            }}>
                            <WsFlex>
                              <Image
                                style={{
                                  width: 14,
                                  height: 14,
                                  marginRight: 4,
                                }}
                                source={{ uri: r.icon }}
                              />
                              <WsText color={$color.danger} size={12} fontWeight={500}>{r.name}</WsText>
                            </WsFlex>
                          </View>
                        </>
                      ))}
                    </WsFlex>
                  )}

              </LlInfoContainer001>
            )}

          {questionVersion &&
            !questionVersion.audit_question_template_version && (
              <>
                {questionVersion &&
                  questionVersion.remark && (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8
                      }}>
                      {questionVersion.remark && (
                        <>
                          <WsText size={14} fontWeight={600} style={{ marginBottom: 8 }}>{t('查核提示')}</WsText>
                          <WsHtmlRender content={questionVersion.remark} />
                        </>
                      )}
                      {questionVersion.attaches &&
                        questionVersion.attaches.length > 0 && (
                          <LlInfoContainer001
                            style={{
                              marginTop: 8,
                              padding: 0,
                            }}>
                            {questionVersion.attaches && (
                              <WsInfo
                                type="files"
                                value={questionVersion.attaches}
                              />
                            )}
                          </LlInfoContainer001>
                        )}
                      {questionVersion.template_attaches &&
                        questionVersion.template_attaches.length > 0 && (
                          <LlInfoContainer001
                            style={{
                              padding: 0,
                              marginTop: 8
                            }}>
                            {questionVersion.template_attaches && (
                              <WsInfo
                                type="files"
                                value={questionVersion.template_attaches}
                              />
                            )}
                          </LlInfoContainer001>
                        )}
                      {questionVersion.file_images &&
                        questionVersion.file_images.length > 0 && (
                          <LlInfoContainer001
                            style={{
                              marginTop: 8,
                              padding: 0,
                            }}>
                            {questionVersion.file_images && (
                              <WsInfo
                                type="filesAndImages"
                                value={questionVersion.file_images}
                              />
                            )}
                          </LlInfoContainer001>
                        )}
                      {questionVersion.file_attaches &&
                        questionVersion.file_attaches.length > 0 && (
                          <LlInfoContainer001
                            style={{
                              marginTop: 8,
                              padding: 0,
                            }}>
                            {questionVersion.file_attaches && (
                              <WsInfo
                                type="filesAndImages"
                                value={questionVersion.file_attaches}
                              />
                            )}
                          </LlInfoContainer001>
                        )}
                    </WsPaddingContainer>
                  )}

                {(questionVersion &&
                  ((questionVersion.article_versions &&
                    questionVersion.article_versions.length > 0) ||
                    (questionVersion.act_version_alls &&
                      questionVersion.act_version_alls.length > 0))) && (
                    <LlInfoContainer001
                      style={{
                        marginTop: 8
                      }}>
                      <View
                        style={{
                          flexDirection: 'row'
                        }}>
                        <WsText size={14} fontWeight={'600'}>
                          {t('法規依據')}
                        </WsText>
                      </View>
                      {questionVersion &&
                        questionVersion.article_versions && (
                          <>
                            {questionVersion.article_versions.map(
                              (article, articleIndex) => {
                                return (
                                  <>
                                    <TouchableOpacity
                                      style={{
                                      }}
                                      key={articleIndex}
                                      onPress={() => {
                                        setStateModal(true)
                                        setSelectVersionId(article.id)
                                      }}>
                                      <View
                                        style={{
                                          marginTop: 8,
                                          flexDirection: 'row',
                                          justifyContent: 'flex-start',
                                          alignItems: 'center',
                                        }}>
                                        <WsInfo
                                          type="link"
                                          value={$_setArticleText(article)}
                                          style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
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
                              }
                            )}
                          </>
                        )}
                      {questionVersion &&
                        questionVersion.act_version_alls &&
                        questionVersion.act_version_alls.length > 0 && (
                          <>
                            {questionVersion.act_version_alls.map(
                              (article, articleIndex) => {
                                return (
                                  <WsInfo
                                    style={{
                                      marginTop: 8
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
                    </LlInfoContainer001>
                  )}

                {(questionVersion &&
                  questionVersion.effects &&
                  questionVersion.effects.length > 0) && (
                    <LlInfoContainer001
                      style={{
                        paddingTop: 0,
                      }}>
                      <>
                        <WsFlex
                          flexWrap="wrap"
                        >
                          {questionVersion.effects.map(r => (
                            <>
                              <View
                                style={{
                                  marginTop: 4,
                                  backgroundColor: $color.danger10l,
                                  borderRadius: 10,
                                  paddingHorizontal: 16,
                                  paddingVertical: 4,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginRight: 8
                                }}>
                                <WsFlex>
                                  <Image
                                    style={{
                                      width: 14,
                                      height: 14,
                                      marginRight: 4,
                                    }}
                                    source={{ uri: r.icon }}
                                  />
                                  <WsText color={$color.danger} size={12} fontWeight={500}>{r.name}</WsText>
                                </WsFlex>
                              </View>
                            </>
                          ))}
                        </WsFlex>
                      </>
                      {questionVersion &&
                        questionVersion.factory_effects &&
                        questionVersion.factory_effects.length > 0 && (
                          <WsFlex
                            flexWrap="wrap"
                            style={{
                              marginTop: 4
                            }}
                          >
                            {questionVersion.factory_effects.map((r, index) => (
                              <>
                                <View
                                  style={{
                                    marginTop: index > 2 ? 8 : 0,
                                    backgroundColor: $color.danger10l,
                                    borderRadius: 10,
                                    paddingHorizontal: 16,
                                    paddingVertical: 4,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8
                                  }}>
                                  {r.icon && (
                                    <Image
                                      style={{
                                        width: 14,
                                        height: 14,
                                        marginRight: 4,
                                      }}
                                      source={{ uri: r.icon }}
                                    />
                                  )}
                                  <WsText color={$color.danger} size={12} fontWeight={500}>{r.name}</WsText>
                                </View>
                              </>
                            ))}
                          </WsFlex>
                        )}

                    </LlInfoContainer001>
                  )}

                {(questionVersion &&
                  questionVersion.related_guidelines &&
                  questionVersion.related_guidelines.length > 0) && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        paddingTop: 8,
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        marginTop: 8,
                        backgroundColor: $color.white,
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
                      {questionVersion &&
                        questionVersion &&
                        questionVersion.related_guidelines &&
                        questionVersion.related_guidelines.length > 0 && (
                          <>
                            <FlatList
                              style={{
                              }}
                              data={questionVersion.related_guidelines}
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
        </ScrollView>
      )}
      <WsModal
        title={t('法規依據')}
        visible={stateModal}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        onBackButtonPress={() => {
          setStateModal(false)
        }}>
        <ViewArticleShowForModal versionId={selectVersionId} />
      </WsModal>
    </>
  )
}

export default AuditQuestionShow
