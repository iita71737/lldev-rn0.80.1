import React from 'react'
import { ScrollView } from 'react-native'
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

const LlArticleDiffCard001 = props => {
  const { t, i18n } = useTranslation()

  // props
  const {
    articleId,
    prevId,
    article
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
    const params = {
      order_by: 'announce_at',
      order_way: 'desc',
      article: articleId
    }
    const versions = await S_ArticleVersion.index({
      params: params
    })
    setAllArticleVersions(versions.data)
    if (prevId) {
      const _versionShow = await S_ArticleVersion.show(article.id) // 目前版本
      const _preVersionShow = await S_ArticleVersion.show(prevId) // 先前版本
      setArticleVersion(_versionShow)
      setPreArticleVersion(_preVersionShow)
    } else {
      const _versionShow = await S_ArticleVersion.show(article.id) // 目前版本
      setArticleVersion(_versionShow)
      setPreArticleVersion('')
    }
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
      allArticleVersions &&
        allArticleVersions.forEach((item, index) => {
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
      {articleVersion && !loading ? (
        <>
          {articleVersion.ll_comment != '' && (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.primary11l
              }}>
              <WsFlex>
                <WsIcon
                  name="ws-outline-check-circle-outline"
                  color={$color.black}
                  size={20}
                />
                <WsText fontWeight={'600'} size={14} style={{ marginLeft: 8 }}>
                  {t('ESGoal評析')}
                </WsText>
              </WsFlex>
              {articleVersion.effects && (
                <WsInfo type="icon" value={articleVersion.effects} iconSize={72} style={{ marginTop: 8 }} />
              )}
              <WsText style={{ paddingTop: 16 }} size={14}>
                {articleVersion.ll_comment}
              </WsText>
            </WsPaddingContainer>
          )}
          <WsPaddingContainer
            style={{
              paddingTop: 0,
              backgroundColor: $color.white
            }}>
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.primary11l
            }}>
            <WsFlex style={{ marginBottom: 16 }}>
              <WsIcon
                name="ws-outline-info"
                color={$color.primary}
                size={20}
              />
              <WsText
                color={$color.primary}
                fontWeight={'600'}
                size={14}
                style={{ marginLeft: 8 }}
              >
                {t('修正前條文')}
              </WsText>
            </WsFlex>
            <WsText>{preArticleVersion?.content ? preArticleVersion?.content : ''}</WsText>
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
              <WsText
                color={$color.primary}
                fontWeight={'600'}
                size={14}
                style={{ marginLeft: 8 }}
              >
                {t('修正後條文')}
              </WsText>
            </WsFlex>
            <WsText>{articleVersion.no_text}</WsText>
            <WsText>{articleVersion.content}</WsText>
          </WsPaddingContainer>
          <WsDiffText
            title={t('修正差異')}
            leadingIcon="ws-outline-edit"
            originContent={preArticleVersion?.content ? preArticleVersion?.content : ''}
            amendContent={articleVersion.content}
            style={{ marginTop: 16 }}
          />
        </>
      ) : (
        <WsSkeleton />
      )}
    </ScrollView>
  )
}

export default LlArticleDiffCard001
