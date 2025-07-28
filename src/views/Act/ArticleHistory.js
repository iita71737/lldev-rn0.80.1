import React from 'react'
import { ScrollView, Dimensions, View } from 'react-native'
import {
  WsIconBtn,
  WsIcon,
  WsFlex,
  WsPaddingContainer,
  WsText,
  WsState,
  WsLoading,
  WsDiffText,
  WsCardPassage,
  WsInfo,
  WsSkeleton
} from '@/components'
import LlToggleTabBar001 from '@/components/LlToggleTabBar001'
import moment from 'moment'
import S_Article from '@/services/api/v1/article'
import S_ArticleVersion from '@/services/api/v1/article_version'
import $color from '@/__reactnative_stone/global/color'
import { WebView } from 'react-native-webview'
import { useTranslation } from 'react-i18next'

const ArticleHistory = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // props
  const { articleId, prevId, article } = route.params

  // States
  const [loading, setLoading] = React.useState(true)
  const [pickValue, setPickValue] = React.useState()
  const [pickItems, setPickItems] = React.useState()

  const [allArticleVersions, setAllArticleVersions] = React.useState()
  const [articleVersion, setArticleVersion] = React.useState()
  const [preArticleVersion, setPreArticleVersion] = React.useState()
  const [currentArticleVersion, setCurrentArticleVersion] = React.useState()

  // Services
  const $_fetchArticleAndArticleVersions = async () => {
    const params = {
      order_by: "announce_at",
      order_way: "desc",
      article: articleId,
    };
    const versions = await S_ArticleVersion.index({
      params: params
    });
    setAllArticleVersions(versions.data)
    const _versionShow = await S_ArticleVersion.show(article.id) // 目前版本
    const _preVersionShow = await S_ArticleVersion.show(prevId) // 對照版本
    setCurrentArticleVersion(_versionShow)
    setArticleVersion(_versionShow)
    setPreArticleVersion(_preVersionShow)
  }

  const $_changeArticleVersions = async () => {
    const _index = allArticleVersions.findIndex(
      version => version.id === pickValue
    )
    const _versionShow = await S_ArticleVersion.show(
      allArticleVersions[_index].id
    )
    const _preVersionShow = await S_ArticleVersion.show(
      allArticleVersions[_index + 1].id
    )
    setArticleVersion(_versionShow)
    setPreArticleVersion(_preVersionShow)
  }

  // Function
  const $_setPickItems = () => {
    const PickItemArr = []
    if (allArticleVersions && allArticleVersions.length > 0) {
      allArticleVersions && allArticleVersions.forEach((item, index) => {
        PickItemArr.push({
          label: moment(item.announce_at).format('YYYY-MM-DD'),
          value: item.id
        })
      })
    }
    PickItemArr.pop()
    setPickItems(PickItemArr)
    setLoading(false)
  }

  const sortedVersions = (a, b) => {
    if (!a.announce_at) {
      return 1
    } else {
      return (
        moment(b.announce_at).format('YYYY-MM-DD') -
        moment(a.announce_at).format('YYYY-MM-DD')
      )
    }
  }

  React.useEffect(() => {
    $_fetchArticleAndArticleVersions()
  }, [])

  React.useEffect(() => {
    if (allArticleVersions) {
      $_setPickItems()
    }
  }, [allArticleVersions])

  React.useEffect(() => {
    if (pickValue) {
      $_changeArticleVersions()
    }
  }, [pickValue])

  return (
    <ScrollView
      style={{
        backgroundColor: $color.white
      }}>
      {articleVersion && preArticleVersion && !loading ? (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
            }}>
            {currentArticleVersion &&
              currentArticleVersion.act_versions && (
                <View>
                  <WsText size={24}>
                    {currentArticleVersion.act_versions.slice(-1)[0] ? currentArticleVersion.act_versions.slice(-1)[0].name : null}
                    {' '}
                    {currentArticleVersion.no_text ? `${currentArticleVersion.no_text}` : null}
                  </WsText>
                </View>
              )
            }
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              borderBottomWidth: 0.3
            }}>
            <WsState
              label={t('選擇版本')}
              type="picker"
              defaultValue={pickItems && pickItems.length > 0 ? pickItems[0].value : ''}
              items={pickItems}
              value={pickValue}
              onChange={setPickValue}
            />
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white
            }}>
            <WsText
              style={{
              }}
              fontWeight={'600'}
            >
              {t('修正條文前後差異')}
            </WsText>
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.primary11l
            }}>
            <WsFlex style={{ marginBottom: 16 }}>
              <WsIcon name="ws-outline-info" color={$color.primary} size={20} />
              <WsText fontWeight={'600'} size={14} style={{ marginLeft: 8 }} color={$color.primary}>
                {t('修正前條文')}
              </WsText>
            </WsFlex>
            <WsText>{preArticleVersion.no_text}</WsText>
            <WsText>{preArticleVersion.content}</WsText>
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              marginTop: 16,
              backgroundColor: $color.primary11l
            }}>
            <WsFlex style={{ marginBottom: 16 }}>
              <WsIcon
                name="ws-outline-check-circle-outline"
                color={$color.primary}
                size={20}
              />
              <WsText fontWeight={'600'} size={14} style={{ marginLeft: 8 }} color={$color.primary}>
                {t('修正後條文')}
              </WsText>
            </WsFlex>
            <WsText>{articleVersion.no_text}</WsText>
            <WsText>{articleVersion.content}</WsText>
          </WsPaddingContainer>
          <WsDiffText
            title={t('修正差異')}
            leadingIcon="ws-outline-edit"
            originContent={preArticleVersion.content}
            amendContent={articleVersion.content}
            style={{ marginTop: 16 }}
          />
          {articleVersion.official_comment != '' && (
            <WsPaddingContainer
              style={{
                marginTop: 16,
                backgroundColor: $color.primary11l
              }}>
              <WsFlex justifyContent="space-between">
                <WsText fontWeight={'600'} size={14} style={{}}>
                  {t('立法理由')}
                </WsText>
                {articleVersion.reference_link != '' && (
                  <WsIconBtn
                    padding={0}
                    name="ws-outline-link"
                    color={$color.primary}
                    size={24}
                    onPress={() => {
                      navigation.navigate({
                        name: 'ReferenceLinkPage',
                        params: {
                          link: articleVersion.reference_link
                        }
                      })
                    }}
                  />
                )}
              </WsFlex>
              <WsCardPassage
                style={{
                  padding: 0
                }}
                passage={articleVersion.official_comment}
                backgroundColor="transparent"
              />
              {articleVersion.attaches && articleVersion.attaches.length > 0 && (
                <WsInfo
                  style={{
                    marginTop: 0
                  }}
                  type="filesAndImages"
                  value={articleVersion.attaches}
                />
              )
              }
            </WsPaddingContainer>
          )}
          {articleVersion.ll_comment != '' && (
            <WsPaddingContainer
              style={{
                marginTop: 16,
                backgroundColor: $color.primary11l
              }}>
              <WsFlex>
                <WsText fontWeight={'700'} size={14} style={{}}>
                  {t('ESGoal評析')}
                </WsText>
              </WsFlex>
              {articleVersion.effects && (
                <WsInfo type="icon" value={articleVersion.effects} iconSize={72} />
              )}
              <WsText style={{}} size={14}>
                {articleVersion.ll_comment}
              </WsText>
            </WsPaddingContainer>
          )}
          <View
            style={{
              height: 60
            }}
          ></View>
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </ScrollView>
  )
}

export default ArticleHistory
