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
import S_License from '@/services/api/v1/license'
import licenseFields from '@/models/license'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import i18next from 'i18next'
import S_LicenseTemplate from '@/services/api/v1/license_templates'
import ServiceCard from '@/services/api/v1/card'
import { useNavigation } from '@react-navigation/native'

const LicenseTemplateShow = ({ route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation();
  const currentLang = i18n.language

  // Params
  const { id } = route.params

  // States
  const [licenseTemplate, setLicenseTemplate] = React.useState()
  const [articleModal, setArticleModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()

  const [modalVisible, setModalVisible] = React.useState(false)
  const [params, setParams] = React.useState({
    timezone: 'Asia/Taipei',
    lang: currentLang ? currentLang : 'tw',
    license_template: id,
  })

  const [filterSearch, setFilterSearch] = React.useState('')
  const [filterLicenseStatus, setFilterLicenseStatus] = React.useState('')

  // Services
  const $_fetchLicenseTemplate = async () => {
    const _params = {
      license_template: id
    }
    const res = await S_LicenseTemplate.show({ params: _params })
    setLicenseTemplate(res)
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
    $_fetchLicenseTemplate()
  }, [route])

  React.useEffect(() => {
    setParams({
      ...params,
      license_template: id
    })
  }, [id])

  return (
    <>
      <ScrollView
        style={{
          flex: 1
        }}
        scrollIndicatorInsets={{ right: 0.1 }}
      >
        {licenseTemplate &&
          licenseTemplate.name && (
            <>
              <WsPaddingContainer
                style={{
                }}>
                <WsText size={28}>{licenseTemplate.name}</WsText>
              </WsPaddingContainer>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white
                }}>
                <WsText size={24}>{t('證照資訊')}</WsText>
                {licenseTemplate.system_subclasses && (
                  <WsFlex
                    style={{
                      marginTop: 4,
                    }}
                  >
                    <WsText size={14} fontWeight={600} style={{ marginRight: 8, width: 140 }}>{t('領域')}</WsText>
                    <WsFlex>
                      {licenseTemplate.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
                        return (
                          <WsTag
                            style={{
                              paddingTop: 0,
                              paddingBottom: 0
                            }}
                            img={systemSubclass.icon}
                            key={systemSubclassIndex}>
                            {t(systemSubclass.name)}
                          </WsTag>
                        )
                      })}
                    </WsFlex>
                  </WsFlex>
                )}
                {licenseTemplate && licenseTemplate.updated_at && ServiceCard.getTags(licenseTemplate, 'props') && (
                  <>
                    <WsFlex
                      alignItems="flex-start"
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <WsTag
                        style={{
                          paddingTop: 4,
                          paddingBottom: 4
                        }}
                        backgroundColor={$color.yellow11l}
                        textColor={$color.gray}>
                        {ServiceCard.getTags(licenseTemplate, 'props')}
                      </WsTag>
                    </WsFlex>
                  </>
                )}

                {licenseTemplate.status && licenseTemplate.status == 2 && (
                  <WsFlex
                    style={{
                      marginTop: 4,
                    }}
                  >
                    <WsText size={14} fontWeight={600} style={{ width: 148 }}>{t('狀態')}</WsText>
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

                <WsInfo
                  labelWidth={140}
                  label={t('更新日期')}
                  value={licenseTemplate && licenseTemplate.updated_at ? moment(licenseTemplate.updated_at).format('YYYY-MM-DD') : null}
                  style={{
                    marginTop: 4,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                />

                {licenseTemplate.license_type &&
                  licenseTemplate.license_type.name && (
                    <WsInfo
                      labelWidth={140}
                      label={t('類型')}
                      value={licenseTemplate.license_type.name}
                      style={{
                        marginTop: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    />
                  )}

                {licenseTemplate.last_version &&
                  licenseTemplate.last_version.statitory_extension_period != undefined && (
                    <WsInfo
                      labelWidth={140}
                      label={t('展延提醒日')}
                      value={`${licenseTemplate.last_version.statitory_extension_period}天`}
                      style={{
                        marginTop: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    />
                  )}

                {licenseTemplate.last_version &&
                  licenseTemplate.last_version.recommend_notify_period != undefined && (
                    <WsInfo
                      labelWidth={140}
                      label={t('建議展延提醒日')}
                      value={`${licenseTemplate.last_version.recommend_notify_period}天`}
                      style={{
                        marginTop: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    />
                  )}
                {licenseTemplate.related_count != undefined && (
                  <WsInfo
                    labelWidth={140}
                    label={t('引用數量')}
                    value={licenseTemplate.related_count ? licenseTemplate.related_count : '0'}
                    style={{
                      marginTop: 4,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />
                )}

              </WsPaddingContainer>

              {licenseTemplate?.last_version &&
                (
                  (licenseTemplate.last_version.act_version_alls?.length > 0) ||
                  (licenseTemplate.last_version.article_versions?.length > 0)
                ) && (
                  <WsPaddingContainer
                    style={{
                      marginTop: 8,
                      backgroundColor: $color.white,
                      justifyContent: 'center',
                      alignItems: 'flex-start'
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row'
                      }}
                    >
                      <WsIcon name={'ll-nav-law-outline'} size={24} style={{ marginRight: 4 }} />
                      <WsText fontWeight={600}>{t('法規依據')}</WsText>
                    </View>

                    {licenseTemplate.last_version.act_version_alls?.map((article, index) => (
                      <WsInfo
                        key={`act-${index}`}
                        style={{ marginTop: 8 }}
                        type="link"
                        value={article.name}
                        onPress={() => {
                          navigation.push('RoutesAct', {
                            screen: 'ActShow',
                            params: { id: article.act.id }
                          })
                        }}
                      />
                    ))}

                    {licenseTemplate.last_version.article_versions?.map((article, index) => (
                      <View
                        key={`article-${index}`}
                        style={{
                          marginTop: 8,
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center'
                        }}
                      >
                        <WsInfo
                          style={{ width: width * 0.8 }}
                          type="link"
                          value={$_setArticleText(article)}
                          onPress={() => {
                            setSelectVersionId(article.id)
                            setArticleModal(true)
                          }}
                        />
                      </View>
                    ))}
                  </WsPaddingContainer>
                )}


              {licenseTemplate &&
                licenseTemplate.last_version &&
                licenseTemplate.last_version.precautions &&
                licenseTemplate.last_version.precautions.length > 0 && (
                  <WsCardPassage
                    title={t('注意事項')}
                    passage={licenseTemplate.last_version.precautions}
                    style={{
                      marginTop: 8
                    }}
                  />
                )}

              {licenseTemplate &&
                licenseTemplate.last_version &&
                licenseTemplate.last_version.expired_comment &&
                licenseTemplate.last_version.expired_comment.length > 0 && (
                  <WsCardPassage
                    title={t('效期說明')}
                    passage={
                      licenseTemplate.last_version.expired_comment
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
          <>
            {params && (
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
                <WsState
                  label={t('狀態')}
                  style={{
                    marginLeft: 16,
                    flex: 1,
                  }}
                  borderWidth={0.3}
                  borderRadius={10}
                  type="picker"
                  value={filterLicenseStatus}
                  onChange={e => {
                    if (e != 'all') {
                      setParams({
                        ...params,
                        license_status: e
                      })
                    } else {
                      let _params = {
                        ...params
                      }
                      delete _params.license_status
                      setParams(_params)
                    }
                    setFilterLicenseStatus(e)
                  }}
                  placeholder={i18next.t('選擇')}
                  items={[
                    {
                      label: i18next.t('全部'),
                      value: 'all'
                    },
                    {
                      label: i18next.t('逾期'),
                      value: 'licenseDelay'
                    },
                    {
                      label: i18next.t('辦理中'),
                      value: 'licenseConduct'
                    },
                    {
                      label: i18next.t('使用中'),
                      value: 'licenseUsing'
                    },
                    {
                      label: i18next.t('已停用'),
                      value: 'licensePause'
                    }
                  ]}
                />
              </WsFlex>
            )}
          </>
        </WsPaddingContainer>

        <>
          <WsInfiniteScroll
            service={S_License}
            params={params}
            renderItem={({ item, index }) => {
              return (
                <View
                  key={index}
                  style={{
                    padding: 16,
                  }}>
                  <LlLicenseCard001
                    item={item}
                    onPress={() => {
                      navigation.navigate({
                        name: 'LicenseShow',
                        params: {
                          id: item.id,
                          type: item.license_type
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

export default LicenseTemplateShow
