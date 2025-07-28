import React from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  Alert
} from 'react-native'
import {
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsHtmlRender
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_ArticleVersion from '@/services/api/v1/article_version'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'

const GuidelineArticleShowForModal = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  //Params
  const {
    versionId,
    _setModalArticle
  } = props

  // State
  const [articleVersion, setArticleVersion] = React.useState()

  // Services
  const $_fetchArticle = async () => {
    try {
      const res = await S_GuidelineArticleVersion.show({ modelId: versionId })
      if (res && res?.message !== 'invalid scopes') {
        setArticleVersion(res)
      }
      else if (res?.message === 'invalid scopes') {
        Alert.alert(t('您無此權限'))
        _setModalArticle(false)
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchArticle()
  }, [versionId])

  return (
    <ScrollView>
      {articleVersion && (
        <>
          <WsPaddingContainer
            padding={0}
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              backgroundColor: $color.white
            }}
          >
            <WsFlex flexWrap="wrap">
              <WsText size={28}>{articleVersion.name ? articleVersion.name : articleVersion.no_text ? articleVersion.no_text : ''}</WsText>
            </WsFlex>
          </WsPaddingContainer>
          <WsPaddingContainer
            padding={0}
            style={{
              paddingHorizontal: 16,
              backgroundColor: $color.white
            }}
          >

            {articleVersion.rich_content ? (
              <WsHtmlRender
                content={articleVersion.rich_content}
                contentWidth={width * 0.8}
              />
            ) : (
              <WsText style={{ paddingLeft: 8 }} size={14}>
                {articleVersion?.content?.replace(/&nbsp;/gi, "") || ""}
              </WsText>
            )}

          </WsPaddingContainer>
        </>
      )}
    </ScrollView>
  )
}

export default GuidelineArticleShowForModal
