import React, { useCallback } from 'react'
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  WsModal,
  WsVersionHistory,
  LlLicenseHeaderCard001,
  LlBtn002,
  WsCardPassage,
  WsIcon,
  WsBtn,
  WsStateInput,
  WsCollapsible,
  WsInfoUser,
  WsAvatar,
  WsState,
  WsTag,
  WsInfiniteScroll,
  LlLicenseCard001,
  WsFilter
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import licenseFields from '@/models/license'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import i18next from 'i18next'
import ServiceCard from '@/services/api/v1/card'
import { useNavigation } from '@react-navigation/native'
import S_Training from '@/services/api/v1/training'
import S_TrainingTemplate from '@/services/api/v1/internal_training_template'
import S_Processor from '@/services/app/processor'

const TrainingTemplateShow = ({ route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation();

  const filterFields = {
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'train_at'
    },
  }

  // PROPS
  const { id } = route.params

  // States
  const [trainingTemplate, setTrainingTemplate] = React.useState()
  const [articleModal, setArticleModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [modalVisible, setModalVisible] = React.useState(false)
  const [filtersValue, setFiltersValue] = React.useState({})
  const [params, setParams] = React.useState({
    timezone: 'Asia/Taipei',
    lang: 'tw',
    internal_training_template: id
  })
  const [filterSearch, setFilterSearch] = React.useState('')

  // Services
  const $_fetchLicenseTemplate = async () => {
    const res = await S_TrainingTemplate.show({ modelId: id })
    setTrainingTemplate(res)
  }

  // HELPER
  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
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

  // FILTER
  const $_setParams = () => {
    const _filtersValue = S_Processor.getFormattedFiltersValue(
      filterFields,
      filtersValue
    )
    let _params = {
      ...params,
      ..._filtersValue,
    }
    setParams(_params)
  }

  React.useEffect(() => {
    $_fetchLicenseTemplate()
  }, [route])

  React.useEffect(() => {
    $_setParams()
  }, [id, filterSearch, filtersValue])

  return (
    <>
      <ScrollView
        testID={'ScrollView'}
        style={{
          flex: 1
        }}
        scrollIndicatorInsets={{ right: 0.1 }}
      >
        {trainingTemplate && (
          <>
            <WsPaddingContainer
              style={{
              }}>
              <WsText size={28}>{trainingTemplate.name}</WsText>
            </WsPaddingContainer>

            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsText size={24}>{t('資訊')}</WsText>
              {trainingTemplate.system_subclasses && (
                <WsFlex
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14} fontWeight={600} style={{ marginRight: 8, width: 100 }}>{t('領域')}</WsText>
                  <WsFlex>
                    {trainingTemplate.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
                      return (
                        <WsTag
                          img={systemSubclass.icon}
                          key={systemSubclassIndex}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      )
                    })}
                  </WsFlex>
                </WsFlex>
              )}

              {trainingTemplate && trainingTemplate.updated_at && ServiceCard.getTags(trainingTemplate, 'props') && (
                <>
                  <WsFlex
                    alignItems="flex-start"
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <WsText size={14} fontWeight={600} style={{ marginRight: 8, width: 100 }}>{t('狀態')}</WsText>
                    <WsTag
                      backgroundColor={$color.yellow11l}
                      textColor={$color.gray}>
                      {ServiceCard.getTags(trainingTemplate, 'props')}
                    </WsTag>
                  </WsFlex>
                </>
              )}

              {trainingTemplate.status && trainingTemplate.status == 2 && (
                <WsFlex
                  style={{
                    marginTop: 4,
                  }}
                >
                  <WsText size={14} fontWeight={600} style={{ width: 108 }}>{t('狀態')}</WsText>
                  <WsFlex>
                    <WsTag
                      style={{
                      }}
                      backgroundColor={$color.yellow11l}
                      textColor={$color.gray}>
                      {t('修訂中')}
                    </WsTag>
                  </WsFlex>
                </WsFlex>
              )}

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  label={t('更新日期')}
                  value={trainingTemplate && trainingTemplate.updated_at ? moment(trainingTemplate.updated_at).format('YYYY-MM-DD') : null}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                />
              </View>

              {trainingTemplate.license_type &&
                trainingTemplate.license_type.name && (
                  <WsInfo
                    labelWidth={100}
                    label={t('類型')}
                    value={trainingTemplate.license_type.name}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />
                )}

              {trainingTemplate.last_version &&
                trainingTemplate.last_version.statitory_extension_period && (
                  <WsInfo
                    labelWidth={100}
                    label={t('類型')}
                    value={`${trainingTemplate.last_version.statitory_extension_period}天`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />
                )}

              {trainingTemplate.last_version &&
                trainingTemplate.last_version.recommend_notify_period && (
                  <WsInfo
                    labelWidth={100}
                    label={t('展延提醒日')}
                    value={`${trainingTemplate.last_version.recommend_notify_period}天`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />
                )}

              {trainingTemplate.related_count != undefined && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    label={t('引用數量')}
                    value={trainingTemplate.related_count ? trainingTemplate.related_count : '0'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />
                </View>
              )}

            </WsPaddingContainer>

            {trainingTemplate &&
              trainingTemplate.last_version &&
              ((trainingTemplate.last_version &&
                trainingTemplate.last_version.act_version_alls &&
                trainingTemplate.last_version.act_version_alls.length != 0) ||
                (trainingTemplate.last_version.article_versions &&
                  trainingTemplate.last_version.article_versions.length > 0)) && (
                <>
                  <WsPaddingContainer
                    style={{
                      marginTop: 8,
                      backgroundColor: $color.white,
                      justifyContent: 'center',
                      alignItems: 'flex-start'
                    }}>
                    <View
                      style={{
                        flexDirection: 'row'
                      }}>
                      <WsIcon name={'ll-nav-law-outline'} size={24} />
                      <WsText>{t('法規依據')}</WsText>
                    </View>
                    {trainingTemplate.last_version &&
                      trainingTemplate.last_version.act_version_alls &&
                      trainingTemplate.last_version.act_version_alls.length != 0 && (
                        <>
                          {trainingTemplate.last_version.act_version_alls.map(
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

                    {trainingTemplate.last_version.article_versions &&
                      trainingTemplate.last_version.article_versions.length > 0 &&
                      trainingTemplate.last_version.article_versions.map(
                        (article, articleIndex) => {
                          return (
                            <View
                              key={articleIndex}
                              style={{
                                marginTop: 8,
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'center'
                              }}>
                              <WsInfo
                                style={{
                                  width: width * 0.8,
                                }}
                                type="link"
                                value={$_setArticleText(article)}
                                onPress={() => {
                                  setSelectVersionId(article.id)
                                  setArticleModal(true)
                                }}
                              />
                            </View>
                          )
                        }
                      )}
                  </WsPaddingContainer>
                </>
              )}

            {trainingTemplate &&
              trainingTemplate.last_version &&
              trainingTemplate.last_version.precautions.length > 0 && (
                <WsCardPassage
                  title={t('注意事項')}
                  passage={trainingTemplate.last_version.precautions}
                  style={{
                    marginTop: 8
                  }}
                />
              )}

            {trainingTemplate &&
              trainingTemplate.last_version &&
              trainingTemplate.last_version.expired_comment &&
              trainingTemplate.last_version.expired_comment.length > 0 && (
                <WsCardPassage
                  title={t('效期說明')}
                  passage={
                    trainingTemplate.last_version.expired_comment
                  }
                  style={{
                    marginTop: 8
                  }}
                />
              )}

            <WsModal
              title={t('法條依據')}
              visible={articleModal}
              headerLeftOnPress={() => {
                setArticleModal(false)
              }}
              onBackButtonPress={() => {
                setArticleModal(false)
              }}>
              <ViewArticleShowForModal versionId={selectVersionId} />
            </WsModal>
          </>
        )}

        <WsPaddingContainer
          style={{
          }}>
          <WsText size={24}>{t('相關文件')}</WsText>
          {params && (
            <>
              <WsFlex
                style={{
                  marginTop: 16,
                }}
              >
                <WsState
                  style={{
                    flex: 1,
                  }}
                  stateStyle={{
                    backgroundColor: $color.primary11l
                  }}
                  label={'搜尋'}
                  borderWidth={0.3}
                  borderRadius={10}
                  type="search"
                  value={filterSearch}
                  onChange={e => {
                    setFilterSearch(e)
                    setParams({
                      ...params,
                      search: e
                    })
                  }}
                  placeholder={i18next.t('搜尋')}
                />
                <View
                  style={{
                    top: 4,
                    paddingTop: 24,
                    paddingLeft: 16,
                    alignItems: 'flex-start'
                  }}>
                  <LlBtn002
                    style={{
                      width: 108,
                    }}
                    onPress={() => {
                      setModalVisible(true)
                    }}
                    onUse={filtersValue ? true : false}>
                    {i18next.t('篩選條件')}
                  </LlBtn002>
                </View>
              </WsFlex>
            </>
          )}
        </WsPaddingContainer>

        <>
          <WsFilter
            visible={modalVisible}
            setModalVisible={setModalVisible}
            onClose={() => {
              setModalVisible(false)
            }}
            filterTypeName={i18next.t('篩選條件')}
            fields={filterFields}
            currentValue={filtersValue}
            onSubmit={$_onFilterSubmit}
            defaultFilter={filtersValue}
          />
          <WsInfiniteScroll
            service={S_Training}
            params={params}
            renderItem={({ item, index }) => {
              return (
                <View
                  key={index}
                  style={{
                    paddingTop: 8,
                    paddingHorizontal: 16,
                  }}>
                  <LlLicenseCard001
                    testID={`LlLicenseCard001-${index}`}
                    item={item}
                    onPress={() => {
                      navigation.navigate({
                        name: 'TrainingShow',
                        params: {
                          id: item.id,
                        }
                      })
                    }}
                    style={{
                      marginTop: 8
                    }}
                  />
                </View>
              )
            }}
          />
        </>
      </ScrollView>
    </>
  )
}

export default TrainingTemplateShow
