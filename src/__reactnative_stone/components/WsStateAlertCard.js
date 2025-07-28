import React from 'react'
import { View, TouchableOpacity, SafeAreaView } from 'react-native'
import {
  WsPaddingContainer,
  WsIcon,
  WsText,
  WsDes,
  WsFlex,
  WsSkeleton,
  WsModal
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import S_Event from '@/services/api/v1/event'
import S_Broadcast from '@/services/api/v1/ll_broadcast'
import S_Change from '@/services/api/v1/change'
import S_ArticleVersion from '@/services/api/v1/article_version'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_ActVersion from '@/services/api/v1/act_version'
import S_GuidelineVersionAdmin from '@/services/api/v1/guideline_version_admin'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import ViewGuidelineArticleShowForModal from '@/views/ActGuideline/GuidelineArticleShowForModal'
import S_TrainingGroup from '@/services/api/v1/internal_training_group'


const WsStateAlertCard = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  // Props
  const {
    value,
    cardType,
    modelId,
    values
  } = props

  // State
  const [loading, setLoading] = React.useState(true)
  const [apiAlert, setApiAlert] = React.useState()
  const [LlBroadcast, setLlBroadcast] = React.useState()
  const [relativeEvent, setRelativeEvent] = React.useState()
  const [relativeChange, setRelativeChange] = React.useState()
  const [relativeArticle, setRelativeArticle] = React.useState()
  const [relativeAct, setRelativeAct] = React.useState()

  const [relativeTrainingGroup, setRelativeTrainingGroup] = React.useState()

  const [relativeGuidelineVersion, setRelativeGuidelineVersion] = React.useState()
  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()
  const [relativeGuidelineArticleVersion, setRelativeGuidelineArticleVersion] = React.useState()

  // 取得警示
  const $_fetchAlert = () => {
    const _alert = S_Alert.setAlertContent(value)
    setApiAlert(_alert)
    setLoading(false)
  }

  // 取得快報
  const $_fetchBroadcast = async () => {
    const _id = value
    const _broadcast = await S_Broadcast.show(_id)
    setLlBroadcast(_broadcast)
    setLoading(false)
  }

  // 取得事件
  const $_fetchRelativeEvent = async () => {
    const _id = value.id
    try {
      const _event = await S_Event.show({ modelId: _id })
      setRelativeEvent(_event)
      setLoading(false)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // 取得相關法條
  const $_fetchRelativeArticle = async () => {
    const _versionId = value && value.id ? value.id : value ? value : undefined
    try {
      const _article = await S_ArticleVersion.show(_versionId)
      setRelativeArticle(_article)
      setLoading(false)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // 取得相關法規
  const $_fetchRelativeAct = async () => {
    const _versionId = value && value.id ? value.id : value ? value : undefined
    try {
      const _act = await S_ActVersion.show({ modelId: _versionId })
      setRelativeAct(_act)
      setLoading(false)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // 取得相關教育訓練群組
  const $_fetchRelativeTrainingGroup = async () => {
    try {
      const res = await S_TrainingGroup.show({ modelId: values?.internal_training_group })
      if (res) {
        setRelativeTrainingGroup(res)
        setLoading(false)
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 取得相關內規
  const $_fetchRelativeGuidelineVersion = async () => {
    const _versionId = value && value.id ? value.id : value ? value : undefined
    try {
      const _guideline = await S_GuidelineVersionAdmin.show({ modelId: _versionId })
      setRelativeGuidelineVersion(_guideline)
      setLoading(false)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // 取得相關內規條文版本
  const $_fetchRelativeGuidelineArticleVersion = async () => {
    try {
      const _params = {
        guideline_article_version: values?.guideline_article_version
      }
      const _guideline = await S_GuidelineArticleVersionAdmin.show({ params: _params })
      setRelativeGuidelineArticleVersion(_guideline)
      setLoading(false)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  //取得相關變動
  const $_fetchRelativeChange = async () => {
    try {
      const _change = await S_Change.show(modelId)
      setRelativeChange(_change)
      setLoading(false)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  React.useEffect(() => {
    if (value && cardType === 'alert') {
      $_fetchAlert()
    }
  }, [value])

  React.useEffect(() => {
    if (value && cardType === 'broadcast') {
      $_fetchBroadcast()
    }
  }, [value])

  React.useEffect(() => {
    if (value && cardType === 'relativeEvent') {
      $_fetchRelativeEvent()
    }
  }, [value])

  React.useEffect(() => {
    if (value && cardType === 'relativeArticle') {
      $_fetchRelativeArticle()
    }
  }, [value])

  React.useEffect(() => {
    if (value && cardType === 'relativeAct') {
      $_fetchRelativeAct()
    }
  }, [value])

  React.useEffect(() => {
    if (value && cardType === 'relativeGuidelineVersion') {
      $_fetchRelativeGuidelineVersion()
    }
  }, [value])

  React.useEffect(() => {
    if (values && values.guideline_article_version && cardType === 'relativeGuidelineArticle') {
      $_fetchRelativeGuidelineArticleVersion()
    }
  }, [values.guideline_article_version])

  React.useEffect(() => {
    if (modelId && cardType === 'relativeChange') {
      $_fetchRelativeChange()
    }
  }, [modelId])

  React.useEffect(() => {
    if (value && cardType === 'relativeTrainingGroup') {
      $_fetchRelativeTrainingGroup()
    }
  }, [value])

  // Render
  return (
    <>
      {loading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <>
          {cardType === 'alert' && (
            <TouchableOpacity onPress={() => {
              navigation.push('RoutesAlert', {
                screen: 'AlertShow',
                params: {
                  id: value.id,
                }
              })
            }}>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  borderRadius: 10,
                  shadowColor: '#999',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 1.5
                }}>
                <WsFlex>
                  <WsFlex alignItems="center">
                    <WsIcon
                      name="ws-filled-alert"
                      color={value.level == 2 ? $color.danger : $color.yellow}
                      size={24}
                    />
                    <View
                      style={{
                        flex: 1,
                        marginTop: -5,
                        marginHorizontal: 16
                      }}>
                      <WsText>
                        {apiAlert.title ? apiAlert.title : 'null'}
                      </WsText>
                      <WsDes>
                        {`${moment(
                          value.created_at
                            ? value.created_at
                            : value.occur_at
                              ? value.occur_at
                              : new Date()
                        ).format('YYYY-MM-DD HH:mm')} ${t('發布')}`}
                      </WsDes>
                    </View>
                    <WsIcon
                      size={24}
                      name="md-chevron-right"
                      color={$color.gray2d}
                    />
                  </WsFlex>
                </WsFlex>
              </WsPaddingContainer>
            </TouchableOpacity>
          )}
          {cardType === 'broadcast' && (
            <TouchableOpacity onPress={() => { }}>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  borderRadius: 10,
                  shadowColor: '#999',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 1.5
                }}>
                <WsFlex>
                  <WsFlex alignItems="center">
                    <WsIcon
                      name="ll-nav-news-filled"
                      color={$color.primary21l}
                      size={24}
                    />
                    <View
                      style={{
                        flex: 1,
                        marginTop: -5,
                        marginHorizontal: 16
                      }}>
                      <WsText>{LlBroadcast.name}</WsText>
                      <WsDes>
                        {`${moment(LlBroadcast.created_at).format(
                          'YYYY-MM-DD HH:mm'
                        )} ${t('發布')}`}
                      </WsDes>
                    </View>
                    <WsIcon
                      size={24}
                      name="md-chevron-right"
                      color={$color.gray2d}
                    />
                  </WsFlex>
                </WsFlex>
              </WsPaddingContainer>
            </TouchableOpacity>
          )}
          {cardType === 'relativeEvent' && relativeEvent && (
            <TouchableOpacity onPress={() => {
              navigation.push('RoutesEvent', {
                screen: 'EventShow',
                params:{
                  id: relativeEvent.alert?.payload?.id
                }
              })
            }}>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  borderRadius: 10,
                  shadowColor: '#999',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 1.5
                }}>
                <WsFlex>
                  <WsFlex alignItems="center">
                    <WsIcon
                      name="ws-filled-alert"
                      color={value.level == 2 ? $color.danger : $color.yellow}
                      size={24}
                    />
                    <View
                      style={{
                        flex: 1,
                        marginTop: -5,
                        marginHorizontal: 16
                      }}>
                      <WsText>
                        {`[${t('相關事件')}] `}
                        {relativeEvent.name ? relativeEvent.name : 'null'}
                      </WsText>
                      <WsDes>
                        {`${moment(
                          value.created_at
                            ? value.created_at
                            : value.occur_at
                              ? value.occur_at
                              : new Date()
                        ).format('YYYY-MM-DD HH:mm')} ${t('發布')}`}
                      </WsDes>
                    </View>
                    <WsIcon
                      size={24}
                      name="md-chevron-right"
                      color={$color.gray2d}
                    />
                  </WsFlex>
                </WsFlex>
              </WsPaddingContainer>
            </TouchableOpacity>
          )}
          {cardType === 'relativeChange' && (
            <TouchableOpacity onPress={() => { }}>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  borderRadius: 10,
                  shadowColor: '#999',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 1.5
                }}>
                <WsFlex>
                  <WsFlex alignItems="center">
                    <WsIcon
                      name="ws-filled-alert"
                      color={
                        relativeChange.level == 2
                          ? $color.danger
                          : $color.yellow
                      }
                      size={24}
                    />
                    <View
                      style={{
                        flex: 1,
                        marginTop: -5,
                        marginHorizontal: 16
                      }}>
                      <WsText>
                        {`[${t('相關變動')}] `}
                        {relativeChange.name ? relativeChange.name : 'null'}
                      </WsText>
                      <WsDes>
                        {`${moment(
                          relativeChange.created_at
                            ? relativeChange.created_at
                            : relativeChange.occur_at
                              ? relativeChange.occur_at
                              : new Date()
                        ).format('YYYY-MM-DD HH:mm')} ${t('發布')}`}
                      </WsDes>
                    </View>
                    <WsIcon
                      size={24}
                      name="md-chevron-right"
                      color={$color.gray2d}
                    />
                  </WsFlex>
                </WsFlex>
              </WsPaddingContainer>
            </TouchableOpacity>
          )}

          {cardType === 'relativeArticle' &&
            relativeArticle &&
            relativeArticle.act_version &&
            relativeArticle.act_version.act && (
              <TouchableOpacity onPress={() => {
                navigation.push('RoutesAct', {
                  screen: 'ActShow',
                  params: {
                    id: relativeArticle.act_version.act.id
                  }
                })
              }}
                style={{ marginTop: 4 }}
              >
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    shadowColor: '#999',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 1.5
                  }}>
                  <WsFlex>
                    <WsFlex alignItems="center">
                      <WsIcon
                        name="ws-filled-alert"
                        size={24}
                        style={{
                          marginRight: 8
                        }}
                      />
                      <View
                        style={{
                          flex: 1,
                        }}>
                        <WsText>
                          {relativeArticle.act_version && relativeArticle.act_version.name ? relativeArticle.act_version.name : 'null'}
                          {' '}
                          {relativeArticle.no_text ? relativeArticle.no_text : 'null'}
                        </WsText>
                        <WsDes>
                          {`${t('法條發布')}  ${moment(
                            relativeArticle.updated_at
                              ? relativeArticle.updated_at
                              : relativeArticle.announce_at
                                ? relativeArticle.announce_at
                                : new Date()
                          ).format('YYYY-MM-DD')}`}
                        </WsDes>
                      </View>
                      <WsIcon
                        size={24}
                        name="md-chevron-right"
                        color={$color.gray2d}
                      />
                    </WsFlex>
                  </WsFlex>
                </WsPaddingContainer>
              </TouchableOpacity>
            )}

          {cardType === 'relativeAct' &&
            relativeAct &&
            relativeAct.id && (
              <TouchableOpacity
                onPress={() => {
                  if (values.act_id) {
                    navigation.push('RoutesAct', {
                      screen: 'ActShow',
                      params: {
                        id: values.act_id
                      }
                    })
                  }
                }}
                style={{ marginTop: 4 }}
              >
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    shadowColor: '#999',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 1.5
                  }}>
                  <WsFlex>
                    <WsFlex alignItems="center">
                      <WsIcon
                        name="ll-nav-law-filled"
                        size={24}
                      />
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: 16
                        }}>
                        <WsText>
                          {relativeAct.name ? relativeAct.name : 'null'}
                        </WsText>

                        <WsFlex>
                          <WsDes>
                            {t('法規發布')}{' '}
                          </WsDes>
                          <WsDes>
                            {relativeAct.announce_at ? moment(relativeAct.announce_at).format('YYYY-MM-DD') : 'null'}
                          </WsDes>
                        </WsFlex>
                      </View>
                      <WsIcon
                        size={24}
                        name="md-chevron-right"
                        color={$color.gray2d}
                      />
                    </WsFlex>
                  </WsFlex>
                </WsPaddingContainer>
              </TouchableOpacity>
            )}

          {cardType === 'relativeTrainingGroup' &&
            relativeTrainingGroup &&
            relativeTrainingGroup.id && (
              <TouchableOpacity
                onPress={() => {
                  if (values) {
                    navigation.push('RoutesTraining', {
                      screen: 'TrainingGroupShow',
                      params: {
                        id: relativeTrainingGroup.id
                      }
                    })
                  }
                }}
                style={{
                  marginTop: 4
                }}
              >
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    shadowColor: '#999',
                    shadowOffset: {
                      width: 0,
                      height: 6
                    },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 1.5
                  }}>
                  <WsFlex>
                    <WsFlex alignItems="center">
                      <WsIcon
                        name="ll-nav-assignment-outline"
                        size={24}
                      />
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: 16
                        }}>
                        <WsText>
                          {relativeTrainingGroup.name ? relativeTrainingGroup.name : 'null'}
                        </WsText>
                        <WsDes
                          style={{
                            marginTop: 8
                          }}>
                          {t('建立日期')}{' '}
                          {moment(relativeTrainingGroup.created_at ? relativeTrainingGroup.created_at : null).format('YYYY-MM-DD')}
                        </WsDes>
                      </View>
                      <WsIcon
                        size={24}
                        name="md-chevron-right"
                        color={$color.gray2d}
                      />
                    </WsFlex>
                  </WsFlex>
                </WsPaddingContainer>
              </TouchableOpacity>
            )}


          {cardType === 'relativeGuidelineVersion' &&
            relativeGuidelineVersion &&
            relativeGuidelineVersion.id && (
              <TouchableOpacity
                onPress={() => {
                  if (values) {
                    navigation.push('RoutesAct', {
                      screen: 'GuidelineShow',
                      params: {
                        id: values.guideline_id,
                        routeByGuidelineVersion: relativeGuidelineVersion
                      }
                    })
                  }
                }}
                style={{
                  marginTop: 4
                }}
              >
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    shadowColor: '#999',
                    shadowOffset: {
                      width: 0,
                      height: 6
                    },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 1.5
                  }}>
                  <WsFlex>
                    <WsFlex alignItems="center">
                      <WsIcon
                        name="ll-nav-internalegulations-outline"
                        size={24}
                      />
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: 16
                        }}>
                        <WsText>
                          {relativeGuidelineVersion.name ? relativeGuidelineVersion.name : 'null'}
                        </WsText>
                        <WsDes
                          style={{
                            marginTop: 8
                          }}>
                          {t('修正發布日')}{' '}
                          {moment(relativeGuidelineVersion.announce_at ? relativeGuidelineVersion.announce_at : null).format('YYYY-MM-DD')}
                        </WsDes>
                      </View>
                      <WsIcon
                        size={24}
                        name="md-chevron-right"
                        color={$color.gray2d}
                      />
                    </WsFlex>
                  </WsFlex>
                </WsPaddingContainer>
              </TouchableOpacity>
            )}

          {cardType === 'relativeGuidelineArticle' &&
            relativeGuidelineArticleVersion &&
            relativeGuidelineArticleVersion.id && (
              <TouchableOpacity
                onPress={() => {
                  if (values) {
                    setModalArticle(true)
                    setArticleVersionId(values?.guideline_article_version)
                  }
                }}
                style={{
                  marginTop: 4
                }}
              >
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    shadowColor: '#999',
                    shadowOffset: {
                      width: 0,
                      height: 6
                    },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 1.5
                  }}>
                  <WsFlex>
                    <WsFlex alignItems="center">
                      <WsIcon
                        name="ll-nav-internalegulations-outline"
                        size={24}
                      />
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: 16
                        }}>
                        <WsText>
                          {relativeGuidelineArticleVersion.name ? relativeGuidelineArticleVersion.name : 'null'}
                        </WsText>
                      </View>
                      <WsIcon
                        size={24}
                        name="md-chevron-right"
                        color={$color.gray2d}
                      />
                    </WsFlex>
                  </WsFlex>
                </WsPaddingContainer>
              </TouchableOpacity>
            )}
        </>
      )}

      <WsModal
        title={t('相關內規')}
        visible={modalArticle}
        headerLeftOnPress={() => {
          setModalArticle(false)
        }}
        onBackButtonPress={() => {
          setModalArticle(false)
        }}>
        <ViewGuidelineArticleShowForModal
          versionId={articleVersionId}
        />
      </WsModal>
    </>
  )
}

export default WsStateAlertCard
