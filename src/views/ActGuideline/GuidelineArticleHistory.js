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
import $color from '@/__reactnative_stone/global/color'
import { WebView } from 'react-native-webview'
import { useTranslation } from 'react-i18next'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'

const GuidelineArticleHistory = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // props
  const {
    articleId,
    guidelineVersion,
    admin = false
  } = props


  // States
  const [loading, setLoading] = React.useState(true)
  const [pickValue, setPickValue] = React.useState()
  const [pickItems, setPickItems] = React.useState()

  const [allArticleVersions, setAllArticleVersions] = React.useState()
  const [articleVersion, setArticleVersion] = React.useState()
  const [preArticleVersion, setPreArticleVersion] = React.useState()

  // Services
  const $_fetchArticleAndArticleVersions = async () => {
    if (!admin) {
      const _params = {
        guideline_article_id: articleId,
      };
      const versions = await S_GuidelineArticleVersion.indexAnnounce({
        params: _params
      });
      setAllArticleVersions(versions.data)
      const firstId = versions.data[0]?.id  // 取得最後一個 id
      const secondId = versions.data[1]?.id;  // 取得倒數第二個 id
      const _versionShow = await S_GuidelineArticleVersion.show({ modelId: firstId }) // 目前版本
      setArticleVersion(_versionShow)
      const _preVersionShow = await S_GuidelineArticleVersion.show({ modelId: secondId }) // 對照版本
      setPreArticleVersion(_preVersionShow)
    } else if (admin) {
      const _params = {
        guideline_article_id: articleId,
      };
      const versions = await S_GuidelineArticleVersionAdmin.indexAnnounce({
        params: _params
      });
      setAllArticleVersions(versions.data)
      const _params1 = {
        guideline_article_version: versions.data[0]?.id,
      }
      const _params2 = {
        guideline_article_version: versions.data[1]?.id,
      }
      const _versionShow = await S_GuidelineArticleVersionAdmin.show({ params: _params1 }) // 目前版本
      setArticleVersion(_versionShow)
      const _preVersionShow = await S_GuidelineArticleVersionAdmin.show({ params: _params2 }) // 對照版本
      setPreArticleVersion(_preVersionShow)
    }
  }

  const $_changeArticleVersions = async () => {
    if (!admin) {
      const _index = allArticleVersions.findIndex(version => version.id === pickValue)
      const _versionShow = await S_GuidelineArticleVersion.show({ modelId: allArticleVersions[_index].id })
      const _preVersionShow = await S_GuidelineArticleVersion.show({ modelId: allArticleVersions[_index + 1].id })
      setArticleVersion(_versionShow)
      setPreArticleVersion(_preVersionShow)
    } else if (admin) {
      const _index = allArticleVersions.findIndex(version => version.id === pickValue)
      const _params1 = {
        guideline_article_version: allArticleVersions[_index].id,
      }
      const _params2 = {
        guideline_article_version: allArticleVersions[_index + 1].id,
      }
      const _versionShow = await S_GuidelineArticleVersionAdmin.show({ params: _params1  })
      const _preVersionShow = await S_GuidelineArticleVersionAdmin.show({ params: _params2 })
      setArticleVersion(_versionShow)
      setPreArticleVersion(_preVersionShow)
    }
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
      {articleVersion &&
        preArticleVersion &&
        !loading ? (
        <>
          <WsPaddingContainer
            padding={0}
            style={{
              paddingTop: 16,
              paddingHorizontal: 16,
              backgroundColor: $color.white,
            }}>
            {guidelineVersion?.name &&
              articleVersion && (
                <View>
                  <WsText size={24}>
                    {guidelineVersion?.name}
                    {'\n'}
                    {articleVersion.name ? `${articleVersion.name}` : null}
                  </WsText>
                </View>
              )
            }
          </WsPaddingContainer>
          <WsPaddingContainer
            padding={0}
            style={{
              paddingTop: 16,
              paddingHorizontal: 16,
              borderBottomWidth: 0.3,
              paddingBottom: 16,
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
              marginHorizontal: 16,
              borderRadius: 10,
              backgroundColor: $color.primary11l
            }}>
            <WsFlex style={{ marginBottom: 16 }}>
              <WsIcon
                color={$color.primary}
                name="ws-outline-info"
                size={20}
              />
              <WsText
                color={$color.primary}
                fontWeight={'600'}
                size={14}
                style={{
                  marginLeft: 8,
                }}
              >
                {t('修正前條文')}
              </WsText>
            </WsFlex>
            <WsText>{preArticleVersion.name}</WsText>
            <WsText
              style={{
                marginTop: 8
              }}
            >{preArticleVersion.content ? preArticleVersion.content : preArticleVersion.rich_content ? preArticleVersion.rich_content : ''}</WsText>
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              marginTop: 16,
              borderRadius: 10,
              backgroundColor: $color.primary11l,
              marginHorizontal: 16,
            }}>
            <WsFlex style={{ marginBottom: 16 }}>
              <WsIcon
                name="ws-outline-check-circle-outline"
                color={$color.primary}
                size={20}
              />
              <WsText
                color={$color.primary}
                fontWeight={'600'}
                size={14}
                style={{ marginLeft: 8 }}
              >
                {t('修正後條文')}
              </WsText>
            </WsFlex>
            <WsText>{articleVersion.name}</WsText>
            <WsText
              style={{
                marginTop: 8
              }}
            >{articleVersion.content ? articleVersion.content : articleVersion.rich_content ? articleVersion.rich_content : ''}</WsText>
          </WsPaddingContainer>

          {preArticleVersion &&
            articleVersion && (
              <>
                <WsDiffText
                  title={t('修正差異')}
                  leadingIcon="ws-outline-edit"
                  originContent={preArticleVersion?.content ? preArticleVersion.content : preArticleVersion.rich_content ? preArticleVersion.rich_content : ''}
                  amendContent={articleVersion?.content ? articleVersion.content : articleVersion.rich_content ? articleVersion.rich_content : ''}
                  style={{
                    marginTop: 16,
                    marginHorizontal: 16,
                    borderRadius: 10,
                  }}
                  originName={preArticleVersion?.name ? preArticleVersion.name : ''}
                  amendName={articleVersion?.name ? articleVersion.name : ''}
                />
              </>
            )}

          <View
            style={{
              height: 120
            }}
          ></View>

        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </ScrollView>
  )
}

export default GuidelineArticleHistory
