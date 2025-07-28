import React from 'react'
import {
  ScrollView,
  View,
  FlatList
} from 'react-native'
import {
  WsFlex,
  WsPaddingContainer,
  LlTrainingHeaderCard001,
  WsInfo,
  WsIcon,
  WsIconBtn,
  WsText,
  WsBottomSheet,
  WsDialogDelete,
  WsInfoUser,
  WsCardPassage,
  WsCollapsible,
  WsPassageCollapse,
  WsModal,
  WsSkeleton,
  WsTabView,
  LlRelatedGuidelineItem001
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_Training from '@/services/api/v1/training'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import license from '@/services/api/v1/license'
import { useNavigation } from '@react-navigation/native'

const TrainingShow = ({ route, ...props }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Params
  const id = props?.id || route?.params?.id || null;

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [training, setTraining] = React.useState(null)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([
    {
      to: {
        name: 'TrainingUpdate',
        params: {
          id: id
        }
      },
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    {
      onPress: () => {
        setDialogVisible(true)
      },
      color: $color.danger,
      labelColor: $color.danger,
      icon: 'ws-outline-delete',
      label: t('刪除')
    }
  ])
  const [loading, setLoading] = React.useState(false)

  // Services
  const $_fetchTraining = async () => {
    setLoading(true)
    try {
      const res = await S_Training.show({ modelId: id })
      setTraining(res)
      $_setStorage(res)
    } catch (e) {
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async res => {
    let _formatForEdit = {
      ...res,
      // 關聯內規（我綁他人）
      related_guidelines_articles: [],
    }
    // 關聯內規（我綁他人）
    res?.related_guidelines?.forEach(item => {
      if (item.guideline_article_version) {
        // 綁特定版本條文
        _formatForEdit.related_guidelines_articles.push({
          ...item.guideline_article_version,
          guideline_id: item?.guideline?.id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article: item?.guideline_article,
          guideline_article_version_id: item?.guideline_article_version?.id,
          bind_version: 'specific_ver',
          bind_type: 'specific_layer_or_article'
        })
      }
      else if (item.guideline_article) {
        // 綁最新版本條文
        _formatForEdit.related_guidelines_articles.push({
          ...item.guideline_article.last_version,
          guideline_id: item?.guideline?.id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article: {
            ...item?.guideline_article?.last_version,
            id: item?.guideline_article?.id
          },
          bind_version: 'last_ver',
          bind_type: 'specific_layer_or_article'
        })
      }
      else if (item.guideline_version) {
        // 綁特定版本整部內規
        _formatForEdit.related_guidelines_articles.push({
          ...item.guideline_version,
          guideline_id: item?.guideline?.id,
          guideline_version: item?.guideline_version,
          bind_version: 'specific_ver',
          bind_type: 'whole_guideline'
        })
      }
      else if (item.guideline) {
        // 綁最新版本整部內規
        _formatForEdit.related_guidelines_articles.push({
          ...item.guideline,
          guideline_id: item?.guideline?.id,
          bind_version: 'last_ver',
          bind_type: 'whole_guideline'
        })
      }
    });
    const _value = JSON.stringify(_formatForEdit)
    await AsyncStorage.setItem('TrainingUpdate', _value)
  }

  // Options
  const $_setNavigationOption = () => {
    const isExpired = moment.utc().isAfter(moment.utc(training?.expired_at));
    navigation.setOptions({
      headerRight: () => {
        if (isExpired) {
          return null;
        }
        return (
          <WsIconBtn
            testID={'ws-outline-edit-pencil'}
            name="ws-outline-edit-pencil"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              setIsBottomSheetActive(true)
            }}
          />
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  React.useEffect(() => {
    $_fetchTraining()
  }, [route, id])

  React.useEffect(() => {
    if (training) {
      $_setNavigationOption()
    }
  }, [training])

  return (
    <>
      <ScrollView
        testID={'ScrollView'}
        scrollIndicatorInsets={{ right: 0.1 }}
      >

        {training ? (
          <>
            <LlTrainingHeaderCard001
              title={training.name}
              update={training.updated_at}
              systemSubclasses={training.system_subclasses}
              lastEditUserImg={training.updated_user.avatar}
              lastEditUserName={training.updated_user.name}
            />
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}>
              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row'
                }}
                label={t('訓練日期')}
                value={moment(training.train_at).format('YYYY-MM-DD')}
              />

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row'
                  }}
                  label={t('編輯截止日')}
                  value={moment(training.expired_at).format('YYYY-MM-DD')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  label={t('負責人')}
                  type={'user'}
                  value={training.principal ? training.principal : t('無')}
                />
              </View>

            </WsPaddingContainer>

            {training.file_sign_in_form &&
              training.file_sign_in_form.length > 0 ? (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('簽到表')}
                  type={'filesAndImages'}
                  value={
                    training.file_sign_in_form
                      ? training.file_sign_in_form
                      : t('尚未上傳')
                  }
                />
              </WsPaddingContainer>
            ) : (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('簽到表')}
                  value={t('尚未上傳')}
                />
              </WsPaddingContainer>
            )}

            {training.file_images &&
              training.file_images.length > 0 ? (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsInfo
                  type="filesAndImages"
                  value={training.file_images}
                  label={t('照片')}
                />
              </WsPaddingContainer>
            ) : (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('照片')}
                  value={t('尚未上傳')}
                />
              </WsPaddingContainer>
            )}

            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}>
              <WsInfo
                label={t('備註')}
                value={training.remark ? training.remark : t('無')}
              />
              <WsFlex
                style={{
                }}>
                <WsIcon
                  name="ws-outline-time"
                  color={$color.gray}
                  size={20}
                  style={{
                  }}
                />
                <WsText
                  color={$color.gray}
                  size={12}
                >
                  {t('編輯時間')}
                  {' '}
                </WsText>
                <WsText
                  color={$color.gray}
                  size={12}
                >
                  {moment(training.remark_updated_at).format('YYYY-MM-DD')}
                </WsText>

                <WsText
                  color={$color.gray}
                  size={12}
                  style={{
                    marginRight: 4
                  }}
                >
                  {' '}
                  {moment(training.remark_updated_at).format('HH:mm:ss')}
                </WsText>

                <WsInfoUser
                  style={{ marginLeft: 4 }}
                  isUri={true}
                  fontsize={12}
                  value={training.remark_updated_user
                    ? training.remark_updated_user
                    : null}
                />
              </WsFlex>
            </WsPaddingContainer>

            {((training &&
              training.internal_training_template &&
              training.internal_training_template.last_version &&
              training.internal_training_template.last_version.article_versions &&
              training.internal_training_template.last_version.article_versions.length > 0) ||
              (
                training.internal_training_template &&
                training.internal_training_template.last_version &&
                training.internal_training_template.last_version.act_version_alls &&
                training.internal_training_template.last_version.act_version_alls.length > 0
              )) && (
                <WsPaddingContainer
                  style={{
                    marginTop: 8,
                    backgroundColor: $color.white,
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}>
                  <WsText size={14} fontWeight="600" >{t('法規依據')}</WsText>
                  {training.internal_training_template &&
                    training.internal_training_template.last_version &&
                    training.internal_training_template.last_version.act_version_alls &&
                    training.internal_training_template.last_version.act_version_alls.length > 0 && (
                      <>
                        {training.internal_training_template.last_version.act_version_alls.map(
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
                  <>
                    <WsPassageCollapse
                      type="array"
                    >
                      {training.internal_training_template.last_version.article_versions.map(
                        (article, articleIndex) => {
                          return (
                            <>
                              <View
                                style={{
                                  flexWrap: 'wrap',
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center',
                                  marginTop: articleIndex == 0 ? 8 : 16,
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
                            </>
                          )
                        }
                      )}
                    </WsPassageCollapse>
                  </>
                </WsPaddingContainer>
              )}

            {(training &&
              training.related_guidelines &&
              training.related_guidelines.length > 0) && (
                <WsPaddingContainer
                  style={{
                    marginTop: 8,
                    backgroundColor: $color.white,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8
                    }}
                  >
                    <WsIcon
                      color={$color.gray}
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
                  {training &&
                    training.related_guidelines &&
                    training.related_guidelines.length > 0 && (
                      <>
                        {/* <FlatList
                          style={{
                          }}
                          data={training.related_guidelines}
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
                        /> */}
                      </>
                    )}

                  <WsPassageCollapse
                    type="array"
                  >
                    {training.related_guidelines.map(
                      (item, index) => {
                        return (
                          <>
                            <LlRelatedGuidelineItem001
                              key={index}
                              item={item}
                            />
                          </>
                        )
                      }
                    )}
                  </WsPassageCollapse>

                </WsPaddingContainer>
              )}

            {training.internal_training_template &&
              training.internal_training_template.last_version.precautions
                .length !== 0 && (
                <WsCardPassage
                  title={t('注意事項')}
                  passage={
                    training.internal_training_template.last_version.precautions
                  }
                  style={{

                    marginTop: 8
                  }}
                />
              )}
            {training.file_attaches &&
              training.file_attaches.length > 0 && (
                <WsPaddingContainer>
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    value={training.file_attaches}
                  />
                </WsPaddingContainer>
              )}
          </>
        ) : (
          <WsSkeleton></WsSkeleton>
        )}

        <View
          style={{
            height: 50,
          }}
        >
        </View>

      </ScrollView>
      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[148, 160]}
        onItemPress={$_onBottomSheetItemPress}
      />
      <WsDialogDelete
        id={id}
        to="TrainingIndex"
        modelName="internal_training"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
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
export default TrainingShow
