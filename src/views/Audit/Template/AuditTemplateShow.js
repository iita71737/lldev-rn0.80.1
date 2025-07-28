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
  // LlLicenseCard001,
  LlAuditListCard001,
  LlAuditListCard002,
  LlAuditListCard003,
  LlAuditListCard004,
  LlAuditListCard005,
  WsFilter,
  WsDes,
  WsSkeleton,
  LlAuditQuestionCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import i18next from 'i18next'
import ServiceCard from '@/services/api/v1/card'
import { useNavigation } from '@react-navigation/native'
import S_AuditTemplates from '@/services/api/v1/audit_template'
import S_AuditQuestionTemplate from '@/services/api/v1/audit_question_template'
import S_Audit from '@/services/api/v1/audit'
import S_AuditQuestion from '@/services/api/v1/audit_question'

const AuditTemplateShow = ({ route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation();

  // Params
  const { id } = route.params

  // States
  const [loading, setLoading] = React.useState(true)
  const [questionInChapters, setQuestionInChapters] = React.useState([])

  const [auditTemplate, setAuditTemplate] = React.useState()
  const [articleModal, setArticleModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()

  const [modalVisible, setModalVisible] = React.useState(false)
  const [params, setParams] = React.useState({
    timezone: 'Asia/Taipei',
    audit_template: id,
    no_renew_template: 0
  })

  const [filterSearch, setFilterSearch] = React.useState('')
  const [filterLicenseStatus, setFilterLicenseStatus] = React.useState('')

  // Services
  const $_fetchLicenseTemplate = async () => {
    const res = await S_AuditTemplates.show({ modelId: id })
    setAuditTemplate(res)
    if (res && res.last_version) {
      const questions = await S_AuditTemplates.getQuesForQuesList(res.last_version?.id)
      setQuestionInChapters(questions)
      setLoading(false)
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

  const $_onQuestionPress = question => {
    navigation.push('RoutesAudit', {
      screen: 'AuditQuestionShow',
      params: {
        question: question,
        templateAPI: true
      }
    })
  }

  React.useEffect(() => {
    $_fetchLicenseTemplate()
  }, [route])

  React.useEffect(() => {
    setParams({
      ...params,
      audit_template: id
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
        {auditTemplate && (
          <>
            <WsPaddingContainer
              style={{
              }}>
              {auditTemplate.name && (
                <WsText size={28}>{auditTemplate.name}</WsText>
              )}
            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsText size={24}>{t('資訊')}</WsText>
              {auditTemplate.system_subclasses && (
                <WsFlex
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14} fontWeight={600} style={{ marginRight: 8, width: 100 }}>{t('領域')}</WsText>
                  <WsFlex>
                    {auditTemplate.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
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

              {auditTemplate && auditTemplate.updated_at && ServiceCard.getTags(auditTemplate, 'props') && (
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
                      {ServiceCard.getTags(auditTemplate, 'props')}
                    </WsTag>

                    {auditTemplate.status == 2 && (
                      <WsTag
                        style={{
                          marginLeft: 4
                        }}
                        backgroundColor={$color.yellow11l}
                        textColor={$color.gray}>
                        {t('修訂中')}
                      </WsTag>
                    )}

                  </WsFlex>
                </>
              )}

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  label={t('更新日期')}
                  value={auditTemplate && auditTemplate.updated_at ? moment(auditTemplate.updated_at).format('YYYY-MM-DD') : null}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                />
              </View>

              {auditTemplate.related_count != undefined && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    label={t('引用數量')}
                    value={auditTemplate.related_count ? auditTemplate.related_count : '0'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />
                </View>
              )}
            </WsPaddingContainer>
          </>
        )}

        <WsPaddingContainer
          style={{
          }}>
          <WsText size={24}>{t('題目')}</WsText>
          {questionInChapters && !loading ? (
            <ScrollView
              style={{
                paddingVertical: 8
              }}>

              {auditTemplate &&
                auditTemplate.last_version &&
                auditTemplate.last_version.audit_question_templates &&
                auditTemplate.last_version.audit_question_templates.length > 0 ? (
                <WsInfo
                  labelWidth={100}
                  value={`${t('共{number}題', { number: auditTemplate.last_version.audit_question_templates.length })}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                />
              ) : (
                <WsInfo
                  labelWidth={100}
                  value={`${t('共{number}題', { number: 0 })}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                />
              )}

              {questionInChapters.map((chapter, chapterIndex) => {
                return (
                  <View key={chapterIndex}>
                    <WsText
                      fontWeight="700"
                      letterSpacing={1}
                      style={[
                        {
                          marginTop: 8,
                          marginLeft: 16
                        }
                      ]}>
                      {chapterIndex + 1}{'.'}{chapter.chapterTitle}
                    </WsText>
                    {chapter.sections.map((section, sectionIndex) => {
                      return (
                        <View key={sectionIndex}>
                          <WsText
                            size={14}
                            letterSpacing={1}
                            fontWeight="700"
                            style={{
                              marginTop: 8,
                              marginLeft: 16
                            }}>
                            {chapterIndex + 1}{'-'}{sectionIndex + 1}{'.'}{section.sectionTitle}
                          </WsText>
                          {section.questions.map((question, questionIndex) => {
                            return (
                              <LlAuditQuestionCard001
                                key={questionIndex}
                                onPress={() => {
                                  $_onQuestionPress(question)
                                }}
                                no={`${chapterIndex + 1}-${sectionIndex + 1}-${questionIndex + 1
                                  }`}
                                title={question.title ? question.title : question.last_version?.title ? question.last_version.title : ''}
                                style={{ marginTop: 8 }}
                                isFocus={
                                  question.keypoint ? true : false
                                }
                              />
                            )
                          })}
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </ScrollView>
          ) : (
            <WsSkeleton></WsSkeleton>
          )}
        </WsPaddingContainer>

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
                        no_renew_template: 0
                      })
                    } else if (e === 'no_renew_template') {
                      let _params = {
                        ...params,
                        no_renew_template: 1
                      }
                      setParams(_params)
                    }
                  }}
                  placeholder={i18next.t('狀態')}
                  items={[
                    {
                      label: i18next.t('全部'),
                      value: 'all'
                    },
                    {
                      label: i18next.t('尚未更新公版版本'),
                      value: 'no_renew_template'
                    }
                  ]}
                />
              </WsFlex>
            </>
          )}
        </WsPaddingContainer>

        <>
          <WsInfiniteScroll
            service={S_Audit}
            params={params}
            renderItem={({ item, index }) => {
              return (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 16,
                  }}>
                  <LlAuditListCard005
                    item={item}
                    onPress={() => {
                      navigation.navigate('RoutesAudit', {
                        screen: 'AuditShow',
                        params: {
                          id: item.id,
                          versionId: item.last_version.id
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
            emptyTitle={i18next.t('找不到符合篩選條件的結果')}
            emptyText={i18next.t('請重新設定您的篩選條件')}
          />
        </>
      </ScrollView>
    </>
  )
}

export default AuditTemplateShow
