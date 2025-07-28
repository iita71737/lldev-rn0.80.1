import React from 'react'
import {
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  FlatList
} from 'react-native'
import {
  WsInfo,
  WsTag,
  WsFlex,
  LlInfoContainer001,
  LlCardActLinks001,
  WsIcon,
  WsText,
  WsModal,
  WsIconBtn,
  WsSkeleton,
  LlRelatedGuidelineItem001,
  WsPaddingContainer
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import S_url from '@/__reactnative_stone/services/app/url'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const CheckListAnswerShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id, apiAlertId } = route.params

  // State
  const [loading, setLoading] = React.useState(true)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)
  const [auditAnswer, setAuditAnswer] = React.useState()

  // Services
  const $_fetAuditAnswer = async () => {
    const res = await S_AuditRecordAns.show({
      modelId: id
    })
    setAuditAnswer(res)
    setLoading(false)
  }

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

  const $_getSpecLimitAttaches = () => {
    const attaches = []
    if (auditAnswer) {
      if (
        auditAnswer.template_attaches &&
        auditAnswer.template_attaches.length != 0
      ) {
        auditAnswer.template_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      } else if (auditAnswer.attaches && auditAnswer.attaches.length != 0) {
        auditAnswer.attaches.forEach(image => {
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

  const $_getSpecLimitImages = () => {
    const images = []
    if (auditAnswer) {
      if (
        auditAnswer.template_attaches &&
        auditAnswer.template_attaches.length != 0
      ) {
        auditAnswer.template_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      } else if (auditAnswer.images && auditAnswer.images.length != 0) {
        auditAnswer.images.forEach(image => {
          const name = S_url.getFileName(image)
          images.push({
            name: name,
            source: image
          })
        })
        return images
      } else {
        return null
      }
    }
  }

  const $_getOcapAttaches = () => {
    const attaches = []
    if (auditAnswer) {
      if (auditAnswer.ocap_attaches && auditAnswer.ocap_attaches.length != 0) {
        auditAnswer.ocap_attaches.forEach(image => {
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

  // const $_getResultItems = score => {
  //   const riskStandard = {
  //     major: {
  //       label: t('嚴重異常'),
  //       icon: 'md-info',
  //       score: 23,
  //       iconColor: $color.danger
  //     },
  //     minor: {
  //       label: t('Minor(次要缺失)'),
  //       icon: 'md-info',
  //       score: 22,
  //       iconColor: $color.yellow
  //     },
  //     ofi: {
  //       label: t('輕度異常'),
  //       icon: 'md-info',
  //       score: 21,
  //       iconColor: $color.primary
  //     },
  //     pass: {
  //       label: t('合規'),
  //       icon: 'md-check-circle',
  //       score: 25,
  //       iconColor: $color.green
  //     }
  //   }
  //   const _key = Object.keys(riskStandard).find(key => {
  //     return riskStandard[key].score == score
  //   })
  //   return riskStandard[_key]
  // }

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
    setLoading(true)
    $_fetAuditAnswer()
    $_setNavigationOption()
  }, [id, apiAlertId])

  return (
    <>
      {loading ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <>
          {!loading && auditAnswer && (
            <ScrollView>
              <LlInfoContainer001>
                <WsInfo label={t('標題')} value={auditAnswer.title} />
                {auditAnswer.keypoint == 1 && (
                  <WsFlex>
                    <WsTag
                      style={{
                        marginTop: 8
                      }}>
                      {t('重點關注')}
                    </WsTag>
                  </WsFlex>
                )}
              </LlInfoContainer001>
              {/* {$_getResultItems(auditAnswer.score) && (
                <LlInfoContainer001
                  style={{
                    marginTop: 8
                  }}>
                  <WsInfo
                    type="status"
                    label={t('答題結果')}
                    value={$_getResultItems(auditAnswer.score)}
                  />
                </LlInfoContainer001>
              )} */}
              {auditAnswer &&
                auditAnswer.remark && (
                  <LlInfoContainer001
                    style={{
                      marginTop: 8
                    }}>
                    <WsInfo
                      label={t('備註')}
                      value={auditAnswer.remark ? auditAnswer.remark : t('無')}
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
                    {$_getSpecLimitImages() && (
                      <WsInfo
                        type="images"
                        style={{
                          marginTop: 8
                        }}
                        value={$_getSpecLimitImages()}
                      />
                    )}

                    {auditAnswer &&
                      auditAnswer.file_images &&
                      auditAnswer.file_images.length > 0 && (
                        <WsInfo
                          type="filesAndImages"
                          style={{
                            marginTop: 8,
                          }}
                          value={auditAnswer.file_images}
                        />
                      )}

                  </LlInfoContainer001>
                )}

              {auditAnswer.ocap_remark && (
                <LlInfoContainer001
                  style={{
                    marginTop: 8
                  }}>
                  <WsInfo
                    label="OCAP"
                    value={
                      auditAnswer.ocap_remark ? auditAnswer.ocap_remar : t('無')
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
              )}
              {((
                auditAnswer &&
                auditAnswer.article_versions &&
                auditAnswer.article_versions.length > 0) ||
                (auditAnswer &&
                  auditAnswer.act_version_alls &&
                  auditAnswer.act_version_alls.length > 0)) && (
                  <LlInfoContainer001
                    padding={0}
                    style={{
                      marginTop: 8
                    }}>
                    <View
                      style={{
                        flexDirection: 'row'
                      }}>
                      <WsIcon
                        name={'ll-nav-law-outline'}
                        size={24}
                        style={{
                          marginRight: 8
                        }}
                      />
                      <WsText size={14} fontWeight={'600'}>
                        {t('法規依據')}
                      </WsText>
                    </View>
                    {auditAnswer &&
                      auditAnswer.act_version_alls &&
                      auditAnswer.act_version_alls.length > 0 && (
                        <>
                          {auditAnswer.act_version_alls.map(
                            (article, articleIndex) => {
                              return (
                                <View
                                  style={{
                                    marginTop: 8
                                  }}
                                >
                                  <WsInfo
                                    testID={`${article.name}`}
                                    style={{
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
                                </View>
                              )
                            }
                          )}
                        </>
                      )}
                    {auditAnswer &&
                      auditAnswer.audit_question_version &&
                      auditAnswer.audit_question_version.article_versions && (
                        <>
                          {auditAnswer.audit_question_version.article_versions.map(
                            (article, articleIndex) => {
                              return (
                                <>
                                  <TouchableOpacity
                                    testID={`${article.name}`}
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
                                        // borderWidth:1,
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
                            }
                          )}
                        </>
                      )}
                    {auditAnswer &&
                      auditAnswer.article_versions && (
                        <>
                          {auditAnswer.article_versions.map(
                            (article, articleIndex) => {
                              return (
                                <>
                                  <TouchableOpacity
                                    testID={`${article.act_version?.name}-${articleIndex}`}
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
                                        marginTop: 8,
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
                            }
                          )}
                        </>
                      )}

                    {auditAnswer &&
                      auditAnswer &&
                      auditAnswer.effects &&
                      auditAnswer.effects.length > 0 && (
                        <WsFlex
                          style={{
                            marginTop: 8
                          }}
                          flexWrap="wrap"
                        >
                          {auditAnswer.effects.map(r => (
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

                    {auditAnswer &&
                      auditAnswer &&
                      auditAnswer.factory_effects &&
                      auditAnswer.factory_effects.length > 0 && (
                        <WsFlex
                          flexWrap="wrap"
                        >
                          {auditAnswer.factory_effects.map(r => (
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

              {auditAnswer.images &&
                auditAnswer.images.length > 0 && (
                  <LlInfoContainer001
                    style={{
                      marginTop: 8
                    }}>
                    <WsInfo
                      labelWidth={60}
                      style={{
                      }}
                      label={t('圖片')}
                      labelColor={$color.gray}
                      type='filesAndImages'
                      value={auditAnswer.images ? auditAnswer.images : []}
                    />
                  </LlInfoContainer001>
                )}

              {(auditAnswer &&
                auditAnswer.related_guidelines &&
                auditAnswer.related_guidelines.length > 0) && (
                  <WsPaddingContainer
                    style={{
                      marginTop: 8,
                      backgroundColor: $color.white
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <WsIcon
                        size={20}
                        name={"ll-nav-internalegulations-outline"}
                        style={{
                          marginRight: 4
                        }}
                      ></WsIcon>
                      <WsText size={14} fontWeight={'600'} style={{}}>
                        {t('相關內規')}
                      </WsText>
                    </View>
                    {auditAnswer &&
                      auditAnswer &&
                      auditAnswer.related_guidelines &&
                      auditAnswer.related_guidelines.length > 0 && (
                        <>
                          <FlatList
                            style={{
                            }}
                            data={auditAnswer.related_guidelines}
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
      )}

    </>
  )
}

export default CheckListAnswerShow
