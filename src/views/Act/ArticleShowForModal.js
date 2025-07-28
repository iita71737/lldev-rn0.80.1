import React from 'react'
import { ScrollView, View } from 'react-native'
import { WsFlex, WsText, WsPaddingContainer, WsInfo } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_ArticleVersion from '@/services/api/v1/article_version'

const ArticleShowForModal = props => {
  const { t, i18n } = useTranslation()

  //Params
  const { versionId } = props

  // State
  const [article, setArticle] = React.useState()

  // Services
  const $_fetchArticle = async () => {
    const res = await S_ArticleVersion.show(versionId)
    setArticle(res)
  }

  // Function
  const $_setTitle = article => {
    if (article && article.last_version && article.last_version.act_version) {
      return `${article.last_version.act_version.name} ${article.last_version.no_text}`
    } else if (article && article.last_version && article.last_version.act_versions) {
      return `${article.last_version.act_versions[0].name} ${article.last_version.no_text}`
    } else if (article && article.act_version && article.act_version.name) {
      return article.act_version.name
    } else {
      return toString(t('無'))
    }
  }

  React.useEffect(() => {
    $_fetchArticle()
  }, [versionId])

  return (
    <ScrollView>
      {article && (
        <>
          <WsPaddingContainer
            padding={0}
            style={{
              paddingTop: 8,
              paddingHorizontal: 16,
              backgroundColor: $color.white
            }}
          >
            <WsFlex
              flexWrap="wrap"
            >
              <WsText size={24} fontWeight={600}>{`${$_setTitle(article.article)} ${t(article.no_text)}`}</WsText>
              {/* <WsText size={24} style={{ marginLeft: 8, paddingVertical: 8 }}>{t(article.no_text)}</WsText> */}
            </WsFlex>
          </WsPaddingContainer>

          <WsPaddingContainer
            padding={0}
            style={{
              paddingHorizontal: 16,
              backgroundColor: $color.white,
              marginTop: 16,
            }}
          >
            <WsText>{article.content}</WsText>
          </WsPaddingContainer>
          {article.attaches.length != 0 && (
            <WsPaddingContainer>
              <WsInfo label={t('附件')} type="files" value={article.attaches} />
            </WsPaddingContainer>
          )}
        </>
      )}
    </ScrollView>
  )
}

export default ArticleShowForModal
