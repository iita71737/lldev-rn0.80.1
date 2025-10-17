import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  Dimensions,
  Image,
  FlatList,
  Platform,
  Linking,
  Pressable,
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsIcon,
  WsCard,
  WsDes,
  WsCollapsible,
  WsInfo,
  WsModal,
  WsState,
  WsAvatar,
  WsLoading,
  WsPaddingContainer,
  LlRelatedGuidelineItem001,
  WsIconBtn
} from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useTranslation } from 'react-i18next'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import CheckBox from '@react-native-community/checkbox'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'

const LlStatisticsQuestionCard001 = (props) => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')
  const navigation = useNavigation()

  const {
    no,
    style,
    onPress,
    answer,
    mode,
    cardColor,
    checkboxVisible = false,
    checkboxOnPress,
    checked,
    done,
    testID
  } = props

  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  const [question, setQuestion] = useState()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [stateModal, setStateModal] = useState(false)
  const [selectVersionId, setSelectVersionId] = useState()
  const [loading, setLoading] = useState(true)
  const [acts, setActs] = useState([])

  // 讓 checkbox 有即時視覺回饋
  const [localChecked, setLocalChecked] = useState(!!checked)
  useEffect(() => {
    if (typeof checked === 'boolean') setLocalChecked(checked)
  }, [checked])

  const setArticleText = (article) => {
    if (article?.act_version) return `${article.act_version.name} ${article.no_text}`
    if (article?.act_versions) return `${article.act_versions[0].name} ${article.no_text}`
    return t('無')
  }
  const scoreText = () => S_CheckListRecordAns.getScoreTextV3(answer)
  const scoreIcon = () => S_CheckListRecordAns.getScoreIconV2(answer)
  const scoreIconColor = () => S_CheckListRecordAns.getScoreIconColorV2(answer)
  const needRemark = () => S_CheckListRecordAns.validationRemark(answer)

  const fetchQuestion = useCallback(async () => {
    if (done) {
      setLoading(false)
      return
    }
    if (answer?.id) {
      try {
        const res = await S_CheckListQuestion.showV2({ modelId: answer.id })
        if (res) {
          setQuestion(res)
          setActs(res?.last_version?.article_versions || [])
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }, [answer?.id, done])

  useEffect(() => {
    if (!isCollapsed) fetchQuestion()
  }, [isCollapsed, fetchQuestion])

  const handleCardPress = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const handleCheckboxChange = useCallback((newValue) => {
    setLocalChecked(newValue)
    checkboxOnPress?.({
      ...answer,
      checked: newValue
    })
  }, [answer, checkboxOnPress])

  const openQuestionShow = useCallback(() => {
    navigation.push('CheckListQuestionShow', {
      id: answer.id,
      simplifyInfo: true
    })
  }, [navigation, answer?.id])

  const openMap = useCallback(() => {
    const lat = answer?.latLng?.latitude
    const lng = answer?.latLng?.longitude
    if (!lat || !lng) return

    if (currentFactory?.map_url === 'gaode') {
      Linking.openURL(`https://uri.amap.com/marker?position=${lng},${lat}`)
    } else if (currentFactory?.map_url === 'naver') {
      Linking.openURL(`https://map.naver.com/v5/?c=126.982814,37.563843,17,0,0,0,d`)
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)
    }
  }, [answer?.latLng, currentFactory?.map_url])

  const openArticleModal = useCallback((id) => {
    setSelectVersionId(id)
    setStateModal(true)
  }, [])

  return (
    <>
      {/* 外層 Pressable：只有點卡片一般區域才展開/收合 */}
      <Pressable
        onPress={handleCardPress}
        style={style}
        android_ripple={{ color: '#00000010' }}
        testID={testID}
      >
        <WsCard padding={16} color={cardColor}>
          {/* Header */}
          <WsFlex justifyContent="space-between" style={{ marginBottom: 8 }}>
            <WsFlex>
              {/* Checkbox：用 capture 攔截觸控，避免觸發外層展開/收合 */}
              {
                !answer?.updated_user && currentUser && checkboxVisible
                  ? (
                    <View
                      style={{ marginRight: 16 }}
                      onStartShouldSetResponderCapture={() => true}
                    >
                      <CheckBox
                        boxType={'square'}
                        animationDuration={0}
                        disabled={false}
                        style={{ width: 20, height: 20 }}
                        value={!!localChecked}
                        onValueChange={handleCheckboxChange}
                      />
                    </View>
                  ) : <View />
              }

              {answer?.keypoint === 1 && (
                <WsTag
                  style={{ backgroundColor: $color.primary11l, marginRight: 4 }}
                  textColor={$color.primary}
                >
                  {t('重點關注')}
                </WsTag>
              )}

              {answer?.is_in_stats === 0 && (
                <WsTag
                  style={{ backgroundColor: $color.yellow11l, marginRight: 4 }}
                  textColor={$color.black}
                >
                  {t('不列入統計')}
                </WsTag>
              )}

              {answer?.last_version?.updated_at &&
                answer?.answer_updated_at &&
                moment.utc(answer.last_version.updated_at).isAfter(moment.utc(answer.answer_updated_at)) && (
                  <WsTag style={{ backgroundColor: $color.danger10l }} textColor={$color.danger}>
                    {t('題目變更')}
                  </WsTag>
                )}
            </WsFlex>

            {
              !answer?.updated_user &&
              !done &&
              answer &&
              currentUser &&
              (
                (answer.question_setting?.checkers?.some(checker => checker.id === currentUser.id)
                  || !answer.question_setting
                  || (answer.question_setting?.checkers?.length === 0))
              ) && (
                <WsFlex>
                  <WsIconBtn
                    padding={0}
                    name="md-visibility"
                    size={30}
                    style={{ marginLeft: 8 }}
                    onPress={openQuestionShow}
                  />
                </WsFlex>
              )
            }
          </WsFlex>

          {/* 題目標題列 */}
          <WsFlex alignItems="flex-start" justifyContent="space-between">
            <WsFlex alignItems="flex-start" style={{ marginRight: 8, flexWrap: 'wrap' }}>
              <WsText fontWeight="bold" size={14} style={{ marginRight: 8 }}>
                {answer?.sequence}{' .'}
              </WsText>
              <WsText fontWeight="bold" size={14}>
                {answer?.title}
              </WsText>
            </WsFlex>
          </WsFlex>

          {/* 答題者 */}
          {/* <WsFlex style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
            <WsText size={14} fontWeight="600" style={{ width: 68 }}>
              {t('答題者')}
            </WsText>

            {answer?.updated_user ? (
              <WsFlex>
                <WsAvatar size={32} isUri source={answer.updated_user?.avatar ?? null} />
                <View style={{ justifyContent: 'center' }}>
                  <WsText size={12} style={{ paddingLeft: 8 }}>
                    {answer.updated_user?.name}
                  </WsText>
                  {answer.updated_at && (
                    <WsFlex style={{ paddingLeft: 8 }}>
                      <WsTag>{t('已完成')}</WsTag>
                      <WsDes style={{ padding: 4 }}>
                        {moment(answer.updated_at).format('YYYY-MM-DD HH:mm')}
                      </WsDes>
                    </WsFlex>
                  )}
                </View>
              </WsFlex>
            ) : (
              <WsInfo
                style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}
                type={
                  (answer?.question_setting?.checkers?.length ?? 0) > 0 ? 'users' : 'user'
                }
                isUri
                value={
                  (answer?.question_setting?.checkers?.length ?? 0) > 0
                    ? answer?.question_setting?.checkers
                    : currentUser
                }
              />
            )}
          </WsFlex> */}

          {/* 位置連結 */}
          {/* {answer?.latLng?.latitude && answer?.latLng?.longitude && (
            <View style={{ marginTop: 8 }}>
              <WsInfo
                type="link"
                label={t('答題位置')}
                value={`${answer.latLng.latitude}, ${answer.latLng.longitude}`}
                onPress={openMap}
                style={{ flexDirection: 'row', flexWrap: 'wrap' }}
              />
            </View>
          )} */}

          {/* 分數 */}
          {/* <WsFlex alignItems="center" style={{ marginTop: 8 }}>
            <WsIcon name={scoreIcon()} size={20} color={scoreIconColor()} />
            <WsText style={{ marginLeft: 8 }} size={14} fontWeight="600">
              {scoreText()}
            </WsText>
          </WsFlex> */}

          {/* 風險 */}
          {/* {answer?.effects?.length > 0 && (
            <>
              <WsFlex>
                <WsIcon color={$color.danger} name="md-info-outline" />
                <WsText
                  style={{ marginTop: 8, marginLeft: 8, marginRight: 8 }}
                  color={$color.danger}
                  size={14}
                  fontWeight="600"
                >
                  {t('風險')}
                </WsText>
              </WsFlex>
              <WsFlex>
                <WsFlex flexWrap="wrap" style={{ width: width - 72 }}>
                  {answer.effects.map((item, index) => (
                    <WsTag
                      key={index}
                      backgroundColor={$color.danger10l}
                      textColor={$color.danger}
                      style={{ marginTop: 4, marginRight: 8 }}
                    >
                      {item.name}
                    </WsTag>
                  ))}
                  {answer.factory_effects?.map((item, index) => (
                    <WsTag
                      key={`f-${index}`}
                      backgroundColor={$color.danger10l}
                      textColor={$color.danger}
                      style={{ marginTop: 4, marginRight: 8 }}
                    >
                      {item.name}
                    </WsTag>
                  ))}
                </WsFlex>
              </WsFlex>
            </>
          )} */}

          {/* 必填提醒 */}
          {needRemark() && !answer?.remark && (
            <>
              <WsFlex style={{ marginTop: 4 }}>
                <WsIcon name={'ws-outline-edit'} size={16} color={$color.danger} />
                <WsText style={{ marginLeft: 8 }} color={$color.danger} size={12}>
                  {t('尚未填寫備註')}
                </WsText>
              </WsFlex>
              <WsFlex style={{ marginTop: 4 }}>
                <WsIcon name={'sc-liff-help-circle'} size={16} color={$color.danger} />
                <WsText style={{ marginLeft: 8 }} color={$color.danger} size={12}>
                  {t('必填資料尚未填寫完整')}
                </WsText>
              </WsFlex>
            </>
          )}

          {/* 摺疊時的圖片摘要 */}
          {isCollapsed && answer?.images?.length > 0 && (
            <WsInfo
              style={{ marginTop: 8 }}
              label={t('相關圖片')}
              type="filesAndImages"
              value={answer.images}
            />
          )}

          {/* 展開內容 */}
          <WsCollapsible isCollapsed={isCollapsed}>
            <View>
              {question?.last_version?.remark && (
                <WsInfo
                  style={{ marginTop: 8 }}
                  label={t('合規標準')}
                  value={question.last_version.remark ?? t('無')}
                />
              )}

              {question?.last_version?.attaches?.length > 0 && (
                <WsInfo
                  label={t('附件')}
                  type="filesAndImages"
                  style={{ marginTop: 8 }}
                  value={question.last_version.attaches}
                />
              )}

              {question?.last_version?.ocap_remark && (
                <WsInfo
                  labelWidth={60}
                  style={{ marginTop: 8 }}
                  label="OCAP"
                  value={question.last_version.ocap_remark ?? t('無')}
                />
              )}

              {question?.last_version?.ocap_attaches?.length > 0 && (
                <WsInfo
                  label={t('OCAP相關附件')}
                  type="filesAndImages"
                  style={{ marginTop: 8 }}
                  value={question.last_version.ocap_attaches}
                />
              )}

              {answer?.remark && (
                <WsInfo style={{ marginTop: 8 }} label={t('備註')} value={answer.remark ?? t('無')} />
              )}

              {answer?.images?.length > 0 && (
                <WsFlex style={{ width: width, marginTop: 8 }}>
                  <WsInfo
                    style={{ marginTop: 8 }}
                    label={t('相關圖片')}
                    type="filesAndImages"
                    value={answer.images}
                  />
                </WsFlex>
              )}

              {answer?.file_images?.length > 0 && (
                <WsFlex style={{ width: width, marginTop: 8 }}>
                  <WsInfo
                    style={{ marginTop: 8 }}
                    label={t('相關圖片')}
                    type="filesAndImages"
                    value={answer.file_images}
                  />
                </WsFlex>
              )}

              {/* 來自 question 的法規列表（all） */}
              {question?.last_version?.act_version_alls?.length ? (
                <>
                  {question.last_version.act_version_alls.map((article, idx) => (
                    <WsInfo
                      key={`ava-${idx}`}
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
                </>
              ) : null}

              {/* 由 API 回來的 acts */}
              <View>
                {loading && <WsLoading type="b" />}
                {!loading && acts?.length > 0 && (
                  <>
                    {acts.map((article, idx) => (
                      <Pressable
                        key={`act-${idx}`}
                        onPress={() => openArticleModal(article.id)}
                        onStartShouldSetResponderCapture={() => true}
                      >
                        <WsInfo
                          type="link"
                          value={setArticleText(article)}
                          style={{}}
                          onPress={() => openArticleModal(article.id)}
                        />
                      </Pressable>
                    ))}
                  </>
                )}
              </View>

              {/* 直接掛在 answer 的法規 */}
              {answer?.article_versions?.length > 0 && (
                <>
                  {answer.article_versions.map((article, idx) => (
                    <Pressable
                      key={`ans-art-${idx}`}
                      onPress={() => openArticleModal(article.id)}
                      onStartShouldSetResponderCapture={() => true}
                    >
                      <WsInfo
                        type="link"
                        value={setArticleText(article)}
                        style={{}}
                        onPress={() => openArticleModal(article.id)}
                      />
                    </Pressable>
                  ))}
                </>
              )}

              {/* 來自 question template 的法規 */}
              {answer?.checklist_question_template?.last_version?.article_versions?.length > 0 && (
                <>
                  <WsFlex style={{ marginTop: 8 }}>
                    <WsIcon name="ll-nav-law-filled" size={24} />
                    <WsText style={{ marginLeft: 4 }} size={14} fontWeight={'600'}>
                      {t('法規依據')}
                    </WsText>
                  </WsFlex>

                  <WsFlex>
                    {answer.checklist_question_template.last_version.article_versions.map((article, idx) => (
                      <Pressable
                        key={`tmpl-art-${idx}`}
                        onPress={() => openArticleModal(article.id)}
                        onStartShouldSetResponderCapture={() => true}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <WsInfo
                            type="link"
                            value={setArticleText(article)}
                            style={{
                              marginTop: 8,
                              marginLeft: 28,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 4
                            }}
                            onPress={() => openArticleModal(article.id)}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </WsFlex>
                </>
              )}

              {/* 相關內規 */}
              {(question?.last_version?.related_guidelines?.length ?? 0) > 0 && (
                <WsPaddingContainer padding={0} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <WsText size={14} fontWeight={'600'} style={{ marginBottom: 8 }}>
                      {t('相關內規')}
                    </WsText>
                  </View>

                  <FlatList
                    data={question.last_version.related_guidelines}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                      <LlRelatedGuidelineItem001 key={index} item={item} />
                    )}
                    ListEmptyComponent={() => null}
                  />
                </WsPaddingContainer>
              )}
            </View>
          </WsCollapsible>
        </WsCard>
      </Pressable>

      {/* 法規 Modal */}
      <WsModal
        title={t('法規依據')}
        visible={stateModal}
        headerLeftOnPress={() => setStateModal(false)}
        onBackButtonPress={() => setStateModal(false)}
      >
        <ViewArticleShowForModal versionId={selectVersionId} />
      </WsModal>
    </>
  )
}

export default LlStatisticsQuestionCard001
